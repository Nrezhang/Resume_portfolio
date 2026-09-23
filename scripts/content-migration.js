const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { isDeepStrictEqual: equal } = require('node:util');

function validate(migration) {
  if (!/^[a-z0-9-]+$/.test(migration.id || '') || !migration.reason || !Array.isArray(migration.patches) || !Array.isArray(migration.assets)) throw new Error('Migration requires a safe id, reason, patches, and assets.');
  for (const patch of migration.patches) {
    if (!['projects', 'experience', 'education'].includes(patch.collection) || !patch.id || !Array.isArray(patch.path) || !patch.path.length || !Object.hasOwn(patch, 'after') || patch.path.some(key => !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) || ['__proto__', 'constructor', 'prototype', 'id'].includes(key))) throw new Error('Invalid migration patch.');
  }
  if (migration.assets.some(asset => !/^static\/media\/[\w.-]+$/.test(asset))) throw new Error('Invalid asset catalog path.');
}

function plan(content, migration) {
  validate(migration);
  const next = structuredClone(content);
  const changes = [];
  for (const patch of migration.patches) {
    const records = next[patch.collection]?.filter(item => item.id === patch.id) || [];
    if (records.length !== 1) throw new Error(`Expected exactly one ${patch.collection}/${patch.id}`);
    let target = records[0];
    for (const key of patch.path.slice(0, -1)) {
      if (target[key] === undefined) target[key] = {};
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) throw new Error(`Invalid parent at ${patch.id}/${key}`);
      target = target[key];
    }
    const field = patch.path.at(-1);
    if (equal(target[field], patch.after)) continue;
    if (!equal(target[field], patch.before)) throw new Error(`Admin-edit conflict: ${patch.collection}/${patch.id}/${patch.path.join('.')}. Review manually; nothing was written.`);
    target[field] = structuredClone(patch.after);
    changes.push(`${patch.collection}/${patch.id}/${patch.path.join('.')}`);
  }
  return { content: next, changes };
}

function aws(args) {
  const result = spawnSync('aws', [...args, '--output', 'json', '--no-cli-pager'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'AWS command failed');
  return result.stdout ? JSON.parse(result.stdout) : {};
}

function migrate(file, apply = false) {
  const migration = JSON.parse(fs.readFileSync(file, 'utf8'));
  const table = process.env.CONTENT_TABLE || 'henry-portfolio-content';
  const { Item: item } = aws(['dynamodb', 'get-item', '--table-name', table, '--key', JSON.stringify({ id: { S: 'portfolio' } }), '--consistent-read']);
  if (!item?.content?.S) throw new Error('Production portfolio record is missing.');
  const result = plan(JSON.parse(item.content.S), migration);
  console.log(JSON.stringify({ migration: migration.id, mode: apply ? 'apply' : 'dry-run', changes: result.changes }, null, 2));
  if (!apply || !result.changes.length) return;
  const directory = path.resolve(process.env.CONTENT_BACKUP_DIR || '.content-backups');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const backup = path.join(directory, `${migration.id}-${Date.now()}.json`);
  fs.writeFileSync(backup, JSON.stringify({ Item: item }, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(`Backup saved: ${backup}`);
  // Preserve every other attribute and prevent overwriting a concurrent admin save.
  aws(['dynamodb', 'put-item', '--table-name', table, '--item', JSON.stringify({ ...item, content: { S: JSON.stringify(result.content) }, updatedAt: { S: new Date().toISOString() } }), '--condition-expression', '#content = :previous', '--expression-attribute-names', JSON.stringify({ '#content': 'content' }), '--expression-attribute-values', JSON.stringify({ ':previous': item.content })]);
  const verified = aws(['dynamodb', 'get-item', '--table-name', table, '--key', JSON.stringify({ id: { S: 'portfolio' } }), '--consistent-read']);
  if (!equal(JSON.parse(verified.Item.content.S), result.content)) throw new Error('Post-write content differs; inspect backup and current content before retrying.');
  console.log('Verified targeted update; all other content preserved.');
}

if (require.main === module) {
  const [file, mode] = process.argv.slice(2);
  if (!file || (mode && mode !== '--apply')) throw new Error('Usage: npm run content:migrate -- content-migrations/NAME.json [--apply]');
  migrate(file, mode === '--apply');
}
module.exports = { plan, validate };

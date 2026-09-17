const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentPath = path.join(root, 'client/src/content/defaultContent.json');
const tableName = process.env.CONTENT_TABLE || 'henry-portfolio-content';
const force = process.argv.includes('--force');

if (process.argv.some((argument) => argument !== '--force' && argument !== process.argv[0] && argument !== process.argv[1])) {
  throw new Error('Usage: npm run seed:content [-- --force]');
}

const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const item = JSON.stringify({
  id: { S: 'portfolio' },
  content: { S: JSON.stringify(content) },
  updatedAt: { S: new Date().toISOString() },
});
const args = ['dynamodb', 'put-item', '--table-name', tableName, '--item', item];

if (!force) args.push('--condition-expression', 'attribute_not_exists(id)');

const result = spawnSync('aws', args, { encoding: 'utf8' });
if (result.status === 0) {
  console.log(`${force ? 'Replaced' : 'Seeded'} portfolio content in ${tableName}.`);
  process.exit(0);
}

if (!force && /ConditionalCheckFailedException/.test(result.stderr)) {
  console.log(`Portfolio content already exists in ${tableName}; no changes were made.`);
  process.exit(0);
}

process.stderr.write(result.stderr || result.error?.message || 'Unable to seed portfolio content.\n');
process.exit(result.status || 1);

const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { plan, validate } = require('./content-migration');

const origin = 'https://www.henryszhang.dev';
function verifyPublishedContent(content, migrations) {
  if (!Array.isArray(content.projects) || !Array.isArray(content.experience)) throw new Error('Invalid production content response.');
  for (const migration of migrations) if (plan(content, migration).changes.length) throw new Error(`${migration.id}: production migration is pending. Back up and apply it before deploying.`);
}

async function verifyDeployedAssets(localManifest, remote, migrations) {
  for (const [key, value] of Object.entries(localManifest.files)) {
    if (remote.files?.[key] !== value) throw new Error(`Deployed build mismatch: ${key}`);
  }
  const assets = Object.entries(remote.files).filter(([key]) => /^static\/(media|js|css)\//.test(key) && !key.endsWith('.map'));
  for (const [key, value] of assets) {
    const url = new URL(value, origin);
    if (url.origin !== origin) throw new Error(`Unexpected asset origin: ${key}`);
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (!response.ok || /text\/html/i.test(response.headers.get('content-type') || '')) throw new Error(`Missing deployed asset: ${key}`);
  }
  for (const migration of migrations) for (const asset of migration.assets) if (!remote.files[asset]) throw new Error(`Missing catalog asset ${asset}`);
  console.log(`Deployed build matches; ${assets.length} static assets are reachable (inline images ship in the verified JS build).`);
}
async function getJson(url) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function validateReleaseDiff(diff) {
  const sensitive = diff.filter(([, file]) => /^(client\/src\/(content\/|static\/|components\/editor\/)|server\/data\/content.json|docs\/media-assets.md)/.test(file));
  const manifests = diff.filter(([status, file]) => status === 'A' && /^content-migrations\/[\w-]+\.json$/.test(file)).map(([, file]) => file);
  if (sensitive.length && !manifests.length) throw new Error('Content/assets changed without a new content-migrations/*.json release plan. Include explicit patches, or explain why no data migration is needed.');
  for (const [status, file] of diff) if (/^content-migrations\/.*\.json$/.test(file) && status !== 'A') throw new Error('Migration manifests are immutable; add a new one instead.');
  return manifests;
}

function releaseFiles(base, workingTree = false) {
  const diff = execFileSync('git', ['diff', '--no-renames', '--name-status', base, ...(workingTree ? [] : ['HEAD'])], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map(line => line.split('\t'));
  if (workingTree) {
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    diff.push(...untracked.map(file => ['A', file]));
  }
  return validateReleaseDiff(diff);
}

async function check({ base, published = false, deployed = false, workingTree = false }) {
  const files = releaseFiles(base, workingTree);
  const local = JSON.parse(fs.readFileSync('client/src/content/defaultContent.json', 'utf8'));
  const migrations = files.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
  for (const migration of migrations) {
    validate(migration);
    if (plan(local, migration).changes.length) throw new Error(`${migration.id}: bundled content must include the migration's result.`);
  }
  console.log(`Validated ${files.length} content release plan(s).`);
  if (published || deployed) {
    const content = await getJson(`${origin}/api/content`);
    verifyPublishedContent(content, migrations);
    console.log('Published content matches this release’s targeted changes.');
  }
  if (deployed) {
    const remote = await getJson(`${origin}/asset-manifest.json`);
    const localManifest = JSON.parse(fs.readFileSync('client/build/asset-manifest.json', 'utf8'));
    await verifyDeployedAssets(localManifest, remote, migrations);
  }
}

if (require.main === module) {
  const base = process.env.CONTENT_DIFF_BASE || process.argv[2];
  if (!base || /^0+$/.test(base)) throw new Error('Provide CONTENT_DIFF_BASE or a base commit argument; refusing to skip release checks.');
  check({ base, published: process.argv.includes('--published'), deployed: process.argv.includes('--deployed'), workingTree: process.argv.includes('--working-tree') }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { releaseFiles, check, validateReleaseDiff, verifyPublishedContent, verifyDeployedAssets };

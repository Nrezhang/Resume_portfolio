const test = require('node:test');
const assert = require('node:assert/strict');
const { plan } = require('../scripts/content-migration');
const { validateReleaseDiff, verifyPublishedContent, verifyDeployedAssets } = require('../scripts/check-content-release');
const release = require('../content-migrations/2026-09-23-project-branding.json');
const defaults = require('../client/src/content/defaultContent.json');
const migration = { id: 'test', reason: 'test', assets: [], patches: [{ collection: 'projects', id: 'inyo', path: ['image'], before: 'portfolio', after: 'inyo' }] };
test('only patches listed fields and preserves unrelated admin changes', () => {
  const old = { profile: { name: 'Admin edit' }, projects: [{ id: 'inyo', image: 'portfolio', description: 'Keep this' }] };
  const next = plan(old, migration);
  assert.deepEqual(next.content, { ...old, projects: [{ ...old.projects[0], image: 'inyo' }] });
  assert.equal(old.projects[0].image, 'portfolio');
  assert.deepEqual(plan(next.content, migration).changes, []);
});
test('conflicting edits abort without mutating input', () => {
  const old = { projects: [{ id: 'inyo', image: 'custom-logo' }] };
  assert.throws(() => plan(old, migration), /Admin-edit conflict/);
  assert.equal(old.projects[0].image, 'custom-logo');
});
test('missing or duplicate records abort', () => {
  assert.throws(() => plan({ projects: [] }, migration), /exactly one/);
  assert.throws(() => plan({ projects: [{ id: 'inyo' }, { id: 'inyo' }] }, migration), /exactly one/);
});
test('released defaults include every targeted change', () => assert.deepEqual(plan(defaults, release).changes, []));
test('published-content gate rejects pending migrations but allows unrelated admin edits', () => {
  assert.throws(() => verifyPublishedContent({ projects: [{ id: 'inyo', image: 'portfolio' }], experience: [] }, [migration]), /pending/);
  assert.doesNotThrow(() => verifyPublishedContent({ projects: [{ id: 'inyo', image: 'inyo', title: 'Edited' }], experience: [] }, [migration]));
});
test('post-deployment gate rejects stale manifests, missing assets and HTML error pages', async t => {
  const manifest = { files: { 'static/js/main.js': '/static/js/main.abc.js', 'static/media/logo.png': '/static/media/logo.abc.png' } };
  t.mock.method(global, 'fetch', async () => ({ ok: true, headers: new Headers({ 'content-type': 'application/octet-stream' }) }));
  await verifyDeployedAssets(manifest, manifest, []);
  await assert.rejects(verifyDeployedAssets(manifest, { files: {} }, []), /mismatch/);
  await assert.rejects(verifyDeployedAssets(manifest, manifest, [{ assets: ['static/media/missing.png'] }]), /Missing catalog/);
  t.mock.method(global, 'fetch', async () => ({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) }));
  await assert.rejects(verifyDeployedAssets(manifest, manifest, []), /Missing deployed asset/);
  t.mock.method(global, 'fetch', async () => ({ ok: false, headers: new Headers() }));
  await assert.rejects(verifyDeployedAssets(manifest, manifest, []), /Missing deployed asset/);
});
test('CI rejects content and asset changes without a new release plan', () => {
  for (const file of ['client/src/content/defaultContent.json', 'server/data/content.json', 'client/src/content/assets.js', 'client/src/static/images/logo.png', 'client/src/components/editor/EditorFields.js']) {
    assert.throws(() => validateReleaseDiff([['M', file]]), /without a new/);
    assert.deepEqual(validateReleaseDiff([['M', file], ['A', 'content-migrations/new-release.json']]), ['content-migrations/new-release.json']);
  }
  assert.throws(() => validateReleaseDiff([['M', 'content-migrations/old.json']]), /immutable/);
  assert.deepEqual(validateReleaseDiff([['M', 'README.md']]), []);
});
test('nested logo patches preserve existing media and reject unsafe keys', () => {
  const change = { ...migration, patches: [{ collection: 'experience', id: 'treasury', path: ['media', 'logo'], after: { src: 'treasury' } }] };
  const result = plan({ experience: [{ id: 'treasury', media: { caption: 'Keep' } }] }, change);
  assert.equal(result.content.experience[0].media.caption, 'Keep');
  assert.throws(() => plan({}, { ...change, patches: [{ ...change.patches[0], path: ['__proto__'] }] }), /Invalid/);
});

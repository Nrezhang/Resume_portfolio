const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

test('preview proxies only public content and refuses writes/authentication', async t => {
  const child = spawn(process.execPath, ['-e', `global.fetch = async (url) => { if (url !== 'https://www.henryszhang.dev/api/content') throw Error('Unexpected destination'); return {ok:true,json:async()=>({profile:{name:'Published Henry'}})}; }; require('./server/server');`], { env: { ...process.env, PORT: '0', PRODUCTION_CONTENT_PREVIEW: 'true' }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  const origin = await new Promise((resolve, reject) => {
    let errors = '';
    child.stderr.on('data', data => { errors += data; });
    const timeout = setTimeout(() => reject(Error('Preview did not start')), 10000);
    child.on('error', error => { clearTimeout(timeout); reject(error); });
    child.on('exit', code => { clearTimeout(timeout); reject(Error(`Preview exited (${code}): ${errors}`)); });
    child.stdout.on('data', data => { const match = String(data).match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timeout); resolve(match[0]); } });
  });
  const response = await fetch(`${origin}/api/content`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).profile.name, 'Published Henry');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  for (const [method, path] of [['PUT', '/api/content'], ['POST', '/api/auth/google'], ['GET', '/api/auth/session'], ['POST', '/api/auth/logout']]) {
    assert.equal((await fetch(`${origin}${path}`, { method })).status, 403);
  }
});

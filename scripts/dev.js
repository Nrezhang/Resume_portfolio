const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const preview = process.argv.includes('--production-content');
const apiPort = preview ? '8081' : (process.env.PORT || '8080');
const previewEnv = preview ? { PRODUCTION_CONTENT_PREVIEW: 'true', REACT_APP_CONTENT_PREVIEW: 'true', REACT_APP_API_URL: `http://127.0.0.1:${apiPort}/api` } : {};
const processes = [
  spawn(process.execPath, [path.join(root, 'server/server.js')], { stdio: 'inherit', env: { ...process.env, ...previewEnv, PORT: apiPort } }),
  spawn('npm', ['--prefix', 'client', 'start'], { cwd: root, stdio: 'inherit', env: { ...process.env, ...previewEnv, HOST: '127.0.0.1', ...(preview ? { PORT: '3001', BROWSER: 'none' } : {}) } }),
];

function stop() {
  processes.forEach((child) => child.kill('SIGTERM'));
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach((child) => child.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code;
}));

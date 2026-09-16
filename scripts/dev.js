const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const processes = [
  spawn(process.execPath, [path.join(root, 'server/server.js')], { stdio: 'inherit' }),
  spawn('npm', ['--prefix', 'client', 'start'], { cwd: root, stdio: 'inherit', env: { ...process.env, HOST: '127.0.0.1' } }),
];

function stop() {
  processes.forEach((child) => child.kill('SIGTERM'));
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach((child) => child.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code;
}));

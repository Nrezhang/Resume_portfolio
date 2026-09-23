const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  });
}

loadEnvironmentFile(path.resolve(__dirname, '../.env'));

const PORT = Number(process.env.PORT || 8080);
const productionPreview = process.env.PRODUCTION_CONTENT_PREVIEW === 'true';
const ADMIN_EMAILS = new Set((process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const SESSION_TTL = 12 * 60 * 60 * 1000;
const root = path.resolve(__dirname, '..');
const dataDirectory = path.join(__dirname, 'data');
const contentPath = path.join(dataDirectory, 'content.json');
const defaultContentPath = path.join(root, 'client/src/content/defaultContent.json');
const sessions = new Map();
const googleClient = new OAuth2Client();

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function setCors(request, response) {
  const allowed = new Set(['https://www.henryszhang.com', process.env.CLIENT_ORIGIN].filter(Boolean));
  const origin = request.headers.origin;
  const isLocalDevelopment = /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin || '');
  if (origin && (allowed.has(origin) || isLocalDevelopment)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON.')); }
    });
    request.on('error', reject);
  });
}

function readContent() {
  return JSON.parse(fs.readFileSync(fs.existsSync(contentPath) ? contentPath : defaultContentPath, 'utf8'));
}

function validateContent(content) {
  return Boolean(
    content && content.profile && typeof content.profile.name === 'string' &&
    Array.isArray(content.projects) && Array.isArray(content.experience) &&
    Array.isArray(content.skills) && content.skills.every((group) => Array.isArray(group.items)) &&
    Array.isArray(content.education) && content.education.every((entry) => entry && Array.isArray(entry.coursework) &&
      (entry.leadership === undefined || (Array.isArray(entry.leadership) && entry.leadership.every((item) =>
        item && typeof item.role === 'string' && typeof item.company === 'string' &&
        Array.isArray(item.highlights) && Array.isArray(item.skills))))) &&
    content.contact
  );
}

function saveContent(content) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const temporaryPath = `${contentPath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporaryPath, contentPath);
}

function tokenFrom(request) {
  const authorization = request.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function authenticated(request) {
  const token = tokenFrom(request);
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}

async function googleIdentity(credential) {
  if (!GOOGLE_CLIENT_ID || !ADMIN_EMAILS.size) throw new Error('Google admin authentication is not configured.');
  if (typeof credential !== 'string' || !credential) return null;

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const identity = ticket.getPayload();
    const email = typeof identity?.email === 'string' ? identity.email.trim().toLowerCase() : '';
    if (!identity?.email_verified || !email) return null;
    return { email };
  } catch {
    return null;
  }
}

const server = http.createServer(async (request, response) => {
  setCors(request, response);
  if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }

  try {
    if (request.url === '/api/health' && request.method === 'GET') return json(response, 200, { status: 'ok' });
    if (productionPreview) {
      response.setHeader('Cache-Control', 'no-store');
      if (request.url !== '/api/content' || request.method !== 'GET') return json(response, 403, { message: 'Production-content preview is read-only. Editing and authentication are disabled.' });
      const upstream = await fetch('https://www.henryszhang.dev/api/content', { signal: AbortSignal.timeout(10000) });
      if (!upstream.ok) return json(response, 502, { message: 'Production content is unavailable. No local fallback is used in preview.' });
      return json(response, 200, await upstream.json());
    }
    if (request.url === '/api/content' && request.method === 'GET') return json(response, 200, readContent());

    if (request.url === '/api/auth/google' && request.method === 'POST') {
      const identity = await googleIdentity((await readBody(request)).credential);
      if (!identity) return json(response, 401, { message: 'Google could not verify this sign-in.' });
      if (!ADMIN_EMAILS.has(identity.email)) return json(response, 403, { message: 'This Google account is not allowed to edit the portfolio.' });
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { email: identity.email, expiresAt: Date.now() + SESSION_TTL });
      return json(response, 200, { token, expiresIn: SESSION_TTL });
    }

    if (request.url === '/api/auth/session' && request.method === 'GET') {
      return authenticated(request) ? json(response, 200, { authenticated: true }) : json(response, 401, { message: 'Your session has expired.' });
    }

    if (request.url === '/api/auth/logout' && request.method === 'POST') {
      sessions.delete(tokenFrom(request));
      return json(response, 200, { success: true });
    }

    if (request.url === '/api/content' && request.method === 'PUT') {
      if (!authenticated(request)) return json(response, 401, { message: 'Sign in is required.' });
      const content = await readBody(request);
      if (!validateContent(content)) return json(response, 400, { message: 'The portfolio data is incomplete. Check education coursework, skills, and required sections.' });
      saveContent(content);
      return json(response, 200, content);
    }

    return json(response, 404, { message: 'Not found.' });
  } catch (error) {
    return json(response, 500, { message: error.message || 'Server error.' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Portfolio API running at http://127.0.0.1:${server.address().port}`);
  if (!GOOGLE_CLIENT_ID || !ADMIN_EMAILS.size) console.log('Google admin authentication is not configured. Set GOOGLE_CLIENT_ID and ADMIN_EMAILS before signing in.');
});

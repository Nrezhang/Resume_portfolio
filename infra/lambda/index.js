const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const {
  DynamoDBClient,
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const dynamo = new DynamoDBClient({});
const secrets = new SecretsManagerClient({});
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
let cachedAuthConfig;
let authConfigExpiresAt = 0;
const googleClient = new OAuth2Client();

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  return JSON.parse(raw);
}

function bearerToken(event) {
  const value = event.headers?.authorization || event.headers?.Authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

function sessionKey(token) {
  return `session#${crypto.createHash('sha256').update(token).digest('hex')}`;
}

async function isAuthenticated(event) {
  const token = bearerToken(event);
  if (!token) return false;
  const result = await dynamo.send(new GetItemCommand({
    TableName: process.env.CONTENT_TABLE,
    Key: { id: { S: sessionKey(token) } },
    ConsistentRead: true,
  }));
  return Number(result.Item?.expiresAt?.N || 0) > Math.floor(Date.now() / 1000);
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

async function getAuthConfig() {
  if (cachedAuthConfig && Date.now() < authConfigExpiresAt) return cachedAuthConfig;
  const result = await secrets.send(new GetSecretValueCommand({ SecretId: process.env.ADMIN_SECRET_ARN }));
  cachedAuthConfig = JSON.parse(result.SecretString || '{}');
  authConfigExpiresAt = Date.now() + 5 * 60 * 1000;
  return cachedAuthConfig;
}

function allowedEmails(config) {
  const entries = Array.isArray(config.allowedEmails) ? config.allowedEmails : String(config.allowedEmails || '').split(',');
  return new Set(entries.map((email) => String(email).trim().toLowerCase()).filter(Boolean));
}

async function googleIdentity(credential) {
  const config = await getAuthConfig();
  const googleClientId = String(config.googleClientId || '');
  const emails = allowedEmails(config);
  if (!googleClientId || !emails.size) throw new Error('Google admin authentication is not configured.');
  if (typeof credential !== 'string' || !credential) return null;

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const identity = ticket.getPayload();
    const email = typeof identity?.email === 'string' ? identity.email.trim().toLowerCase() : '';
    if (!identity?.email_verified || !email) return null;
    return { email, allowed: emails.has(email) };
  } catch {
    return null;
  }
}

async function getContent() {
  const result = await dynamo.send(new GetItemCommand({
    TableName: process.env.CONTENT_TABLE,
    Key: { id: { S: 'portfolio' } },
    ConsistentRead: true,
  }));
  return result.Item?.content?.S ? JSON.parse(result.Item.content.S) : null;
}

async function saveContent(content) {
  await dynamo.send(new PutItemCommand({
    TableName: process.env.CONTENT_TABLE,
    Item: {
      id: { S: 'portfolio' },
      content: { S: JSON.stringify(content) },
      updatedAt: { S: new Date().toISOString() },
    },
  }));
}

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const rawPath = event.rawPath || event.path || '/';
  const route = rawPath.replace(/^\/api/, '') || '/';

  try {
    if (method === 'GET' && route === '/health') return response(200, { status: 'ok' });
    if (method === 'GET' && route === '/content') {
      const content = await getContent();
      return content ? response(200, content) : response(404, { message: 'Using bundled content until the first save.' });
    }

    if (method === 'POST' && route === '/auth/google') {
      const identity = await googleIdentity(parseBody(event).credential);
      if (!identity) return response(401, { message: 'Google could not verify this sign-in.' });
      if (!identity.allowed) return response(403, { message: 'This Google account is not allowed to edit the portfolio.' });
      const now = Date.now();
      const token = crypto.randomBytes(32).toString('hex');
      await dynamo.send(new PutItemCommand({
        TableName: process.env.CONTENT_TABLE,
        Item: {
          id: { S: sessionKey(token) },
          email: { S: identity.email },
          expiresAt: { N: String(Math.floor((now + SESSION_TTL_MS) / 1000)) },
        },
      }));
      return response(200, { token, expiresIn: SESSION_TTL_MS });
    }

    if (method === 'GET' && route === '/auth/session') {
      return await isAuthenticated(event) ? response(200, { authenticated: true }) : response(401, { message: 'Your session has expired.' });
    }

    if (method === 'POST' && route === '/auth/logout') {
      const token = bearerToken(event);
      if (token) await dynamo.send(new DeleteItemCommand({
        TableName: process.env.CONTENT_TABLE,
        Key: { id: { S: sessionKey(token) } },
      }));
      return response(200, { success: true });
    }

    if (method === 'PUT' && route === '/content') {
      if (!await isAuthenticated(event)) return response(401, { message: 'Sign in is required.' });
      const content = parseBody(event);
      if (!validateContent(content)) return response(400, { message: 'The portfolio data is incomplete. Check education coursework, skills, and required sections.' });
      await saveContent(content);
      return response(200, content);
    }

    return response(404, { message: 'Not found.' });
  } catch (error) {
    console.error(error);
    return response(500, { message: 'Server error.' });
  }
};

function resetAuthConfigForTests() {
  cachedAuthConfig = undefined;
  authConfigExpiresAt = 0;
}

exports.__testables = {
  allowedEmails,
  clients: { dynamo, googleClient, secrets },
  resetAuthConfigForTests,
  sessionKey,
  validateContent,
};

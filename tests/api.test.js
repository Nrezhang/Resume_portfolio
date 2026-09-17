const assert = require('node:assert/strict');
const test = require('node:test');
const defaultContent = require('../client/src/content/defaultContent.json');
const { handler, __testables } = require('../infra/lambda/index.js');

const event = (method, path, { body, token } = {}) => ({
  body: body === undefined ? undefined : JSON.stringify(body),
  headers: token ? { authorization: `Bearer ${token}` } : {},
  rawPath: `/api${path}`,
  requestContext: { http: { method } },
});

const payload = (response) => JSON.parse(response.body);

function mockAuthConfig(t) {
  __testables.resetAuthConfigForTests();
  t.after(() => __testables.resetAuthConfigForTests());
  t.mock.method(__testables.clients.secrets, 'send', async () => ({
    SecretString: JSON.stringify({
      googleClientId: 'test-client-id',
      allowedEmails: ['henryszhang83@gmail.com', 'hsz2011@nyu.edu'],
    }),
  }));
}

test('accepts the bundled portfolio document', () => {
  assert.equal(__testables.validateContent(defaultContent), true);
});

test('rejects malformed education content', () => {
  const malformed = structuredClone(defaultContent);
  malformed.education = { coursework: [] };
  assert.equal(__testables.validateContent(malformed), false);
});

test('normalizes and limits the editor allowlist', () => {
  const emails = __testables.allowedEmails({ allowedEmails: ['HenrySZhang83@gmail.com ', 'hsz2011@nyu.edu'] });
  assert.equal(emails.has('henryszhang83@gmail.com'), true);
  assert.equal(emails.has('other@example.com'), false);
});

test('never stores a raw session token as its DynamoDB key', () => {
  const token = 'session-token-for-test';
  assert.notEqual(__testables.sessionKey(token), token);
  assert.match(__testables.sessionKey(token), /^session#[a-f0-9]{64}$/);
});

test('retrieves the portfolio document from DynamoDB', async (t) => {
  t.mock.method(__testables.clients.dynamo, 'send', async (command) => {
    assert.equal(command.constructor.name, 'GetItemCommand');
    assert.deepEqual(command.input.Key, { id: { S: 'portfolio' } });
    return { Item: { content: { S: JSON.stringify(defaultContent) } } };
  });

  const response = await handler(event('GET', '/content'));

  assert.equal(response.statusCode, 200);
  assert.deepEqual(payload(response), defaultContent);
});

test('rejects a Google credential that cannot be verified', async (t) => {
  mockAuthConfig(t);
  t.mock.method(__testables.clients.googleClient, 'verifyIdToken', async () => {
    throw new Error('invalid token');
  });

  const response = await handler(event('POST', '/auth/google', { body: { credential: 'invalid' } }));

  assert.equal(response.statusCode, 401);
  assert.equal(payload(response).message, 'Google could not verify this sign-in.');
});

test('rejects a verified Google account outside the allowlist', async (t) => {
  mockAuthConfig(t);
  t.mock.method(__testables.clients.googleClient, 'verifyIdToken', async () => ({
    getPayload: () => ({ email: 'visitor@example.com', email_verified: true }),
  }));

  const response = await handler(event('POST', '/auth/google', { body: { credential: 'valid' } }));

  assert.equal(response.statusCode, 403);
  assert.match(payload(response).message, /not allowed/i);
});

test('rejects a Google account with an unverified email', async (t) => {
  mockAuthConfig(t);
  t.mock.method(__testables.clients.googleClient, 'verifyIdToken', async () => ({
    getPayload: () => ({ email: 'henryszhang83@gmail.com', email_verified: false }),
  }));

  const response = await handler(event('POST', '/auth/google', { body: { credential: 'valid' } }));

  assert.equal(response.statusCode, 401);
});

test('creates a hashed, expiring session for an allowed Google account', async (t) => {
  mockAuthConfig(t);
  let storedSession;
  t.mock.method(__testables.clients.googleClient, 'verifyIdToken', async () => ({
    getPayload: () => ({ email: 'HenrySZhang83@gmail.com ', email_verified: true }),
  }));
  t.mock.method(__testables.clients.dynamo, 'send', async (command) => {
    storedSession = command.input.Item;
    return {};
  });

  const response = await handler(event('POST', '/auth/google', { body: { credential: 'valid' } }));
  const responseBody = payload(response);

  assert.equal(response.statusCode, 200);
  assert.match(responseBody.token, /^[a-f0-9]{64}$/);
  assert.equal(responseBody.expiresIn, 12 * 60 * 60 * 1000);
  assert.equal(storedSession.email.S, 'henryszhang83@gmail.com');
  assert.equal(storedSession.id.S, __testables.sessionKey(responseBody.token));
  assert.notEqual(storedSession.id.S, responseBody.token);
  assert.ok(Number(storedSession.expiresAt.N) > Math.floor(Date.now() / 1000));
});

test('rejects publishing with an expired session', async (t) => {
  let calls = 0;
  t.mock.method(__testables.clients.dynamo, 'send', async (command) => {
    calls += 1;
    assert.equal(command.constructor.name, 'GetItemCommand');
    return { Item: { expiresAt: { N: '1' } } };
  });

  const response = await handler(event('PUT', '/content', { body: defaultContent, token: 'expired' }));

  assert.equal(response.statusCode, 401);
  assert.equal(calls, 1);
});

test('publishes validated content for an authorized session', async (t) => {
  const commands = [];
  t.mock.method(__testables.clients.dynamo, 'send', async (command) => {
    commands.push(command);
    if (command.constructor.name === 'GetItemCommand') {
      return { Item: { expiresAt: { N: String(Math.floor(Date.now() / 1000) + 60) } } };
    }
    return {};
  });

  const response = await handler(event('PUT', '/content', { body: defaultContent, token: 'active' }));

  assert.equal(response.statusCode, 200);
  assert.equal(commands.length, 2);
  assert.equal(commands[1].constructor.name, 'PutItemCommand');
  assert.equal(commands[1].input.Item.id.S, 'portfolio');
  assert.deepEqual(JSON.parse(commands[1].input.Item.content.S), defaultContent);
});

test('does not overwrite published content when validation fails', async (t) => {
  const commands = [];
  t.mock.method(__testables.clients.dynamo, 'send', async (command) => {
    commands.push(command);
    return { Item: { expiresAt: { N: String(Math.floor(Date.now() / 1000) + 60) } } };
  });
  const malformed = structuredClone(defaultContent);
  malformed.education = { coursework: [] };

  const response = await handler(event('PUT', '/content', { body: malformed, token: 'active' }));

  assert.equal(response.statusCode, 400);
  assert.match(payload(response).message, /incomplete/i);
  assert.equal(commands.length, 1);
  assert.equal(commands[0].constructor.name, 'GetItemCommand');
});

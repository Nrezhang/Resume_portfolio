const assert = require('node:assert/strict');
const test = require('node:test');
const defaultContent = require('../client/src/content/defaultContent.json');
const { __testables } = require('../infra/lambda/index.js');

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

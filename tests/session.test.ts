import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPassword, createSessionToken, SESSION_TTL_SECONDS, verifySessionToken } from '../lib/session.ts';

process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.ADMIN_SECRET = 'x'.repeat(40);

test('een vers token is geldig', async () => {
  assert.equal(await verifySessionToken(await createSessionToken()), true);
});

test('een verlopen token is ongeldig', async () => {
  const token = await createSessionToken(Date.now() - (SESSION_TTL_SECONDS + 60) * 1000);
  assert.equal(await verifySessionToken(token), false);
});

test('een aangepast token is ongeldig', async () => {
  const [, sig] = (await createSessionToken()).split('.');
  const later = Math.floor(Date.now() / 1000) + 10 * SESSION_TTL_SECONDS;
  assert.equal(await verifySessionToken(`${later}.${sig}`), false);
  assert.equal(await verifySessionToken('onzin'), false);
  assert.equal(await verifySessionToken(undefined), false);
});

test('wachtwoord wijzigen maakt oude tokens ongeldig', async () => {
  const token = await createSessionToken();
  process.env.ADMIN_PASSWORD = 'nieuw wachtwoord';
  assert.equal(await verifySessionToken(token), false);
  process.env.ADMIN_PASSWORD = 'correct horse battery staple';
});

test('wachtwoordcontrole', async () => {
  assert.equal(await checkPassword('correct horse battery staple'), true);
  assert.equal(await checkPassword('fout'), false);
  assert.equal(await checkPassword(''), false);
});

test('in productie werkt niets zonder wachtwoord en secret', async () => {
  const env = process.env as Record<string, string | undefined>;
  const { NODE_ENV, ADMIN_PASSWORD } = env;
  env.NODE_ENV = 'production';
  delete env.ADMIN_PASSWORD;
  assert.equal(await checkPassword('demo'), false);
  await assert.rejects(createSessionToken());
  env.NODE_ENV = NODE_ENV;
  env.ADMIN_PASSWORD = ADMIN_PASSWORD;
});

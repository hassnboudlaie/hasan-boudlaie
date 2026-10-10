import assert from 'node:assert/strict';
import http from 'node:http';
import { createGateway } from './gateway.mjs';

const browserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36';
const publicOrigin = 'http://access.test';
const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const close = server => new Promise(resolve => { server.closeAllConnections();server.close(resolve); });
function call(port, path, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request({ hostname: '127.0.0.1', port, path, method, headers: { Host: 'access.test', 'User-Agent': browserAgent, ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Origin: publicOrigin } : {}), ...headers } }, res => {
      const chunks = [];res.on('data', c => chunks.push(c));res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);req.end(data);
  });
}
let upstreamOrigin, calls = 0, badRedirect = false, stored = null;
const upstream = http.createServer(async (req, res) => {
  calls++;
  assert.equal(req.headers['oai-authenticated-user-id'], undefined);
  assert.equal(req.headers['x-qa-key'], undefined);
  if (req.url === '/okr.html') { res.writeHead(302, { Location: badRedirect ? 'https://attacker.invalid/' : '/okr' });res.end();return; }
  if (req.url === '/okr') { res.setHeader('Content-Type', 'text/html');res.end('<!doctype html><script>const CLOUD_ORIGIN=' + JSON.stringify(upstreamOrigin) + ';</script>');return; }
  if (req.url.startsWith('/assets/') || req.url === '/favicon.svg') { res.setHeader('Content-Type', 'image/svg+xml');res.end('<svg xmlns="http://www.w3.org/2000/svg"/>');return; }
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/okr/health') { res.end('{"ok":true}');return; }
  if (['POST', 'PUT'].includes(req.method)) assert.equal(req.headers.origin, upstreamOrigin);
  if (req.url === '/api/okr/login') { res.setHeader('Set-Cookie', '__Host-kish_session=test-session; Path=/; Secure; HttpOnly; SameSite=Lax');res.end('{"csrf":"test-csrf"}');return; }
  if (req.headers.cookie !== '__Host-kish_session=test-session') { res.statusCode = 401;res.end('{"error":"Sign in required"}');return; }
  if (['POST', 'PUT'].includes(req.method) && req.headers['x-csrf-token'] !== 'test-csrf') { res.statusCode = 403;res.end('{"error":"CSRF rejected"}');return; }
  if (req.url === '/api/okr/invite') { res.end(JSON.stringify({ activationUrl: upstreamOrigin + '/okr.html#activate/fictional-test-token' }));return; }
  if (req.url === '/api/okr/state') {
    if (req.method === 'PUT') { const chunks = [];for await (const chunk of req) chunks.push(chunk);stored = JSON.parse(Buffer.concat(chunks).toString()); }
    res.end(JSON.stringify(stored));return;
  }
  res.end('{"ok":true}');
});
const upstreamPort = await listen(upstream);upstreamOrigin = 'http://127.0.0.1:' + upstreamPort;
const gateway = createGateway({ publicOrigin, upstreamOrigin, allowHttp: true, maxRequestBytes: 2048 });
const gatewayPort = await listen(gateway);
try {
  assert.equal((await call(gatewayPort, '/healthz')).status, 200);
  const page = await call(gatewayPort, '/');assert.equal(page.status, 200);assert.ok(page.text.includes(publicOrigin));assert.ok(!page.text.includes(upstreamOrigin));
  assert.equal((await call(gatewayPort, '/assets/kishports_main.svg')).status, 200);
  assert.equal((await call(gatewayPort, '/okr', { method: 'HEAD' })).text, '');
  assert.equal((await call(gatewayPort, '/api/okr/state')).status, 401);
  const before = calls;
  assert.equal((await call(gatewayPort, '/api/okr/login', { method: 'POST', body: {}, headers: { Origin: 'https://attacker.invalid' } })).status, 403);
  assert.equal((await call(gatewayPort, '/api/okr/qa', { method: 'POST', body: {}, headers: { 'X-QA-Key': 'retired' } })).status, 404);
  assert.equal((await call(gatewayPort, '/api/okr/state?url=https://attacker.invalid')).status, 400);
  assert.equal((await call(gatewayPort, '/api/okr/state', { headers: { Host: 'attacker.invalid' } })).status, 400);
  assert.equal((await call(gatewayPort, '/api/okr/login', { method: 'POST', body: { tooLarge: 'x'.repeat(2500) } })).status, 413);
  assert.equal(calls, before, 'Rejected requests must not reach the upstream');
  const login = await call(gatewayPort, '/api/okr/login', { method: 'POST', body: { email: 'test@example.invalid', password: 'fictional-test-password' }, headers: { 'oai-authenticated-user-id': 'forged' } });
  assert.equal(login.status, 200);assert.ok(login.headers['set-cookie'][0].includes('Secure; HttpOnly; SameSite=Lax'));
  const headers = { Cookie: '__Host-kish_session=test-session; unrelated=not-forwarded', 'X-CSRF-Token': 'test-csrf' };
  assert.equal((await call(gatewayPort, '/api/okr/state', { method: 'PUT', body: { revision: 2, state: { fictional: true } }, headers })).status, 200);
  const secondSession = await call(gatewayPort, '/api/okr/state', { headers });assert.equal(JSON.parse(secondSession.text).revision, 2);
  assert.equal((await call(gatewayPort, '/api/okr/state', { method: 'PUT', body: {}, headers: { Cookie: headers.Cookie } })).status, 403);
  const invite = await call(gatewayPort, '/api/okr/invite', { method: 'POST', body: {}, headers });assert.equal(JSON.parse(invite.text).activationUrl, publicOrigin + '/okr.html#activate/fictional-test-token');
  badRedirect = true;assert.equal((await call(gatewayPort, '/okr')).status, 502);
  assert.throws(() => createGateway({ publicOrigin: 'http://insecure.invalid' }));
  console.log('PASS: gateway HTTP routing, browser Origin enforcement, session/CSRF forwarding, link rewriting, upstream state pass-through, size bounds, host/query rejection, closed QA and external-redirect rejection. Mock upstream; not a Render deployment.');
} finally { await close(gateway);await close(upstream); }

if (process.argv.includes('--live')) {
  const live = createGateway({ publicOrigin, allowHttp: true });const port = await listen(live);
  try {
    const health = await call(port, '/api/okr/health');assert.equal(health.status, 200, health.text);assert.equal(JSON.parse(health.text).authentication, 'organization-account');
    const page = await call(port, '/');assert.equal(page.status, 200);assert.ok(page.text.includes("const CLOUD_ORIGIN='" + publicOrigin + "'"));
    const anonymous = await call(port, '/api/okr/state');assert.equal(anonymous.status, 401);
    console.log('PASS: candidate gateway reaches the current production health/page and preserves anonymous-state rejection from this environment. No real credentials or organization data used. Iran/Render network unverified.');
  } finally { await close(live); }
}

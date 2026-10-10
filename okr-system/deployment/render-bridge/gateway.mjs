import http from 'node:http';
import { pathToFileURL } from 'node:url';

const DEFAULT_UPSTREAM = 'https://kish-okr-execution.hasanboudlaie.chatgpt.site';
const assets = new Set(['/favicon.svg', '/assets/kishports_main.svg', '/assets/airport_opration.svg']);
const apiActions = new Set(['health', 'me', 'state', 'audit', 'members', 'backups', 'login', 'activate', 'logout', 'profile', 'invite', 'reset-password']);
class GatewayError extends Error { constructor(status, message) { super(message); this.status = status; } }
const reject = (status, message) => { throw new GatewayError(status, message); };

function readBody(req, limit) {
  if (Number(req.headers['content-length']) > limit) reject(413, 'Request too large');
  return new Promise((resolve, rejectBody) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { chunks.length = 0; rejectBody(new GatewayError(413, 'Request too large')); }
      else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', rejectBody);
  });
}

export function createGateway({ publicOrigin, upstreamOrigin = DEFAULT_UPSTREAM, fetchImpl = fetch, allowHttp = false, maxRequestBytes = 4 * 1024 * 1024 } = {}) {
  const external = new URL(publicOrigin), upstream = new URL(upstreamOrigin);
  for (const url of [external, upstream]) {
    if ((!allowHttp && url.protocol !== 'https:') || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Configure plain HTTPS origins');
  }
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    try {
      const url = new URL(req.url, external.origin), method = req.method;
      if (url.origin !== external.origin || req.headers.host !== external.host) reject(400, 'Invalid request host');
      if (method === 'GET' && url.pathname === '/healthz') {
        res.setHeader('Content-Type', 'application/json');res.end('{"ok":true,"component":"kish-okr-gateway"}');return;
      }
      if (!['GET', 'POST', 'PUT', 'HEAD'].includes(method)) reject(405, 'Method not allowed');
      const action = url.pathname.match(/^\/api\/okr\/([a-z-]+)$/)?.[1];
      const html = ['/', '/okr', '/okr.html'].includes(url.pathname);
      if (!(action && apiActions.has(action)) && !html && !assets.has(url.pathname)) reject(404, 'Not found');
      if (!action && !['GET', 'HEAD'].includes(method)) reject(405, 'Method not allowed');
      if (['POST', 'PUT'].includes(method)) {
        if (req.headers.origin !== external.origin) reject(403, 'Invalid request origin');
        if (!req.headers['content-type']?.startsWith('application/json')) reject(415, 'JSON required');
      }
      if ([...url.searchParams.keys()].some(k => k !== 'revision') || (url.search && action !== 'backups')) reject(400, 'Unsupported query');
      const headers = { Accept: action ? 'application/json' : 'text/html,image/svg+xml,*/*' };
      // Keep the real browser User-Agent; never forward platform identity or proxy-auth headers.
      if (typeof req.headers['user-agent'] === 'string') headers['User-Agent'] = req.headers['user-agent'].slice(0, 512);
      if (action) {
        const session = req.headers.cookie?.match(/(?:^|;\s*)__Host-kish_session=([^;]*)/)?.[1];
        if (session !== undefined) headers.Cookie = '__Host-kish_session=' + session;
        if (req.headers['x-csrf-token']) headers['X-CSRF-Token'] = String(req.headers['x-csrf-token']).slice(0, 100);
        headers['Content-Type'] = 'application/json';
        if (['POST', 'PUT'].includes(method)) headers.Origin = upstream.origin;
      }
      const body = ['POST', 'PUT'].includes(method) ? await readBody(req, maxRequestBytes) : undefined;
      let target = new URL((html ? '/okr.html' : url.pathname) + url.search, upstream.origin), response;
      for (let redirects = 0; redirects <= 3; redirects++) {
        response = await fetchImpl(target, { method, headers, body, redirect: 'manual', signal: AbortSignal.timeout(30000) });
        if (![301, 302, 303, 307, 308].includes(response.status)) break;
        if (!['GET', 'HEAD'].includes(method) || !response.headers.get('location') || redirects === 3) reject(502, 'Unexpected upstream redirect');
        const next = new URL(response.headers.get('location'), target);
        if (next.origin !== upstream.origin || !['/', '/okr', '/okr.html'].includes(next.pathname)) reject(502, 'Unexpected upstream redirect');
        await response.body?.cancel();target = next;
      }
      const contentType = response.headers.get('content-type') || '';
      if (action && !contentType.includes('application/json')) reject(502, 'Organization service unavailable');
      if (html && (!response.ok || !contentType.includes('text/html'))) reject(502, 'Organization service unavailable');
      let content = Buffer.from(await response.arrayBuffer());
      if (content.length > 8 * 1024 * 1024) reject(502, 'Upstream response too large');
      if (html) content = Buffer.from(content.toString().split(upstream.origin).join(external.origin));
      if (['invite', 'reset-password'].includes(action) && response.ok) {
        const value = JSON.parse(content.toString());
        if (value.activationUrl?.startsWith(upstream.origin + '/')) value.activationUrl = external.origin + value.activationUrl.slice(upstream.origin.length);
        content = Buffer.from(JSON.stringify(value));
      }
      const cookies = response.headers.getSetCookie().filter(c => c.startsWith('__Host-kish_session='));
      if (cookies.length) res.setHeader('Set-Cookie', cookies);
      res.statusCode = response.status;
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      if (method === 'HEAD') res.end();else res.end(content);
    } catch (e) {
      if (res.headersSent) { res.destroy();return; }
      res.statusCode = e instanceof GatewayError ? e.status : 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: e instanceof GatewayError ? e.message : 'ارتباط با سامانه موقتاً برقرار نیست. / Organization service temporarily unavailable.' }));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createGateway({ publicOrigin: process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL, upstreamOrigin: process.env.UPSTREAM_ORIGIN || DEFAULT_UPSTREAM });
  server.requestTimeout = 35000;server.headersTimeout = 15000;
  server.listen(Number(process.env.PORT || 10000), '0.0.0.0', () => console.log('Kish OKR gateway ready'));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}

// Self-contained contract test (#12): boots the built service and verifies it
// upholds the @unerp/service-kit extension contract — no full core needed.
import { spawn } from 'child_process';
import {
  signTenantToken, signWebhook,
  WEBHOOK_SIGNATURE_HEADER, WEBHOOK_TIMESTAMP_HEADER, TENANT_TOKEN_HEADER,
} from '@unerp/service-kit';

const PORT = 4104;
const SECRET = 'contract-secret';
const APP = 'healthcare';
const HEALTH = 'http://localhost:' + PORT + '/svc/health';

const svc = spawn('node', ['dist/main.js'], {
  env: { ...process.env, PORT: String(PORT), EXT_SERVICE_JWT_SECRET: SECRET },
  stdio: 'inherit',
});
let failed = 0;
const check = (name, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) failed++; };

async function waitHealthy() {
  for (let i = 0; i < 30; i++) {
    try { const r = await fetch(HEALTH); if (r.ok) return r; } catch {}
    await new Promise((s) => setTimeout(s, 500));
  }
  throw new Error('service did not become healthy');
}

try {
  const h = await (await waitHealthy()).json();
  check('health shape { status, apiVersion, app }', h.status === 'ok' && h.apiVersion === 1 && h.app === APP);

  // tenant-token middleware: unknown path with no token -> 401
  const noTok = await fetch('http://localhost:' + PORT + '/__contract_probe');
  check('no tenant token -> 401', noTok.status === 401);

  // valid token -> passes middleware (not 401)
  const tok = signTenantToken({ tenantId: 't', userId: 'u', roles: [], appSlug: APP, scopes: [APP + ':read', APP + ':write'] }, SECRET);
  const withTok = await fetch('http://localhost:' + PORT + '/__contract_probe', { headers: { [TENANT_TOKEN_HEADER]: tok } });
  check('valid tenant token -> not 401', withTok.status !== 401);

  // events webhook: unsigned -> 401, signed -> 204
  const un = await fetch('http://localhost:' + PORT + '/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  check('unsigned webhook -> 401', un.status === 401);
  const ts = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({ event: 'ping', tenantId: 't' });
  const sig = signWebhook(body, SECRET, ts);
  const ok = await fetch('http://localhost:' + PORT + '/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', [WEBHOOK_SIGNATURE_HEADER]: sig, [WEBHOOK_TIMESTAMP_HEADER]: String(ts) },
    body,
  });
  check('signed webhook -> 204', ok.status === 204);
} catch (e) {
  console.error(e); failed++;
} finally {
  svc.kill();
}
process.exit(failed ? 1 : 0);

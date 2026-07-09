// Publishes bundle/manifest.json to a UniERP core instance via the developer
// (vendor) API: create package if missing -> create bundle -> submit -> approve.
//   UNIERP_API_URL=http://localhost:4000 UNIERP_EMAIL=... UNIERP_PASSWORD=... node scripts/publish-bundle.mjs
import { readFileSync } from 'fs';

const API = (process.env.UNIERP_API_URL || 'http://localhost:4000') + '/api/v1';
const EMAIL = process.env.UNIERP_EMAIL || 'admin@unerp.dev';
const PASSWORD = process.env.UNIERP_PASSWORD || 'admin123';

const manifest = JSON.parse(readFileSync(new URL('../bundle/manifest.json', import.meta.url)));

let csrf = null; // double-submit cookie: echo csrf_token cookie as x-csrf-token

async function call(path, opts = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrf ? { Cookie: `csrf_token=${csrf}`, 'x-csrf-token': csrf } : {}),
      ...(opts.headers || {}),
    },
  });
  const setCookie = res.headers.get('set-cookie') || '';
  const m = setCookie.match(/csrf_token=([^;]+)/);
  if (m) csrf = m[1];
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const login = await call('/auth/login', { method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
const token = login.accessToken || login.access_token || login.token || login?.data?.accessToken;
if (!token) throw new Error(`No token in login response: ${JSON.stringify(login).slice(0, 200)}`);

const apps = await call('/developer/apps', {}, token);
let pkg = (Array.isArray(apps) ? apps : apps?.data || []).find((a) => a.slug === manifest.slug);
if (!pkg) {
  pkg = await call('/developer/apps', {
    method: 'POST',
    body: JSON.stringify({
      name: manifest.name,
      description: manifest.description,
      longDescription: manifest.longDescription,
      category: manifest.category,
      icon: manifest.icon,
      pricing: manifest.pricing,
      tags: manifest.tags,
    }),
  }, token);
  console.log(`created package ${pkg.slug} (${pkg.id})`);
}

const bundle = await call(`/developer/apps/${pkg.id}/bundles`, {
  method: 'POST',
  body: JSON.stringify({ manifest, channel: 'stable', changelog: `v${manifest.version}` }),
}, token);
console.log(`created bundle ${manifest.version} (${bundle.id})`);

await call(`/developer/bundles/${bundle.id}/submit`, { method: 'PUT' }, token);
const approved = await call(`/developer/review/${bundle.id}/approve`, { method: 'PUT' }, token);
console.log(`published: ${JSON.stringify(approved?.listing?.slug || approved?.slug || manifest.slug)}@${manifest.version}`);

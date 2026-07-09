// Lightweight manifest sanity check for CI (mirrors core's validateManifest rules
// that matter at build time; core re-validates on publish and install).
import { readFileSync } from 'fs';

const m = JSON.parse(readFileSync(new URL('../bundle/manifest.json', import.meta.url)));
const fail = (msg) => { console.error(`manifest invalid: ${msg}`); process.exit(1); };

for (const k of ['name', 'slug', 'version', 'category', 'vendor']) if (!m[k]) fail(`missing ${k}`);
if (!/^\d+\.\d+\.\d+([-+].+)?$/.test(m.version)) fail('version not semver');
if (m.runtime !== 'declarative+service') fail('runtime must be declarative+service');
if (!m.service?.healthcheck?.startsWith('/')) fail('service.healthcheck must be absolute path');
if (m.apiVersion !== 1) fail('apiVersion must be 1');
console.log(`manifest ok: ${m.slug}@${m.version}`);

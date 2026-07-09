// Builds bundle/manifest.json (v3.0.0, declarative+service) from the
// healthcare bundle source, rewriting core-resident API URLs to the
// extension gateway (/api/v1/ext/healthcare/...).
import { writeFileSync } from 'fs';
import { join } from 'path';
import { HEALTHCARE_BUNDLES } from './healthcare-bundles';

const healthcare = HEALTHCARE_BUNDLES.find((m) => m.slug === 'healthcare');
if (!healthcare) throw new Error('healthcare manifest not found');

const rewritten = JSON.parse(
  JSON.stringify(healthcare).split('/api/v1/healthcare').join('/api/v1/ext/healthcare'),
);

const manifest = {
  ...rewritten,
  version: '3.1.0',
  apiVersion: 1,
  vendor: 'unierp',
  runtime: 'declarative+service',
  service: {
    routePrefix: 'healthcare',
    baseUrlEnv: 'HEALTHCARE_SERVICE_URL',
    defaultBaseUrl: 'http://localhost:4104',
    healthcheck: '/svc/health',
    scopes: ['healthcare:read', 'healthcare:write'],
    timeoutMs: 15000,
  },
};

writeFileSync(join(__dirname, '../bundle/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`built bundle ${manifest.slug}@${manifest.version} (${(manifest.modules || []).length} modules)`);

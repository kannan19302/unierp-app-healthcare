import { TENANT_TOKEN_HEADER } from '@unerp/service-kit';
import { currentToken } from './token-store';

const CORE_API_URL = (process.env.CORE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

/**
 * Reads this app's provisioned CustomRecords from core via the ext-callback
 * API, authenticated by echoing the request's tenant token.
 */
export async function coreRecords(schemaSlug: string): Promise<any[]> {
  const res = await fetch(`${CORE_API_URL}/api/v1/ext-callback/records/${schemaSlug}`, {
    headers: { [TENANT_TOKEN_HEADER]: currentToken() },
  });
  if (!res.ok) return [];
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

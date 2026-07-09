import { CoreClient } from '@unerp/service-kit';
import { currentToken } from './token-store';

const CORE_API_URL = (process.env.CORE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

/** A CoreClient bound to the current request's tenant token. */
export function coreClient(): CoreClient {
  return new CoreClient({ coreApiUrl: CORE_API_URL, token: currentToken() });
}

/** Read one provisioned schema's records (thin wrapper over CoreClient). */
export async function coreRecords(schemaSlug: string): Promise<any[]> {
  return coreClient().records(schemaSlug);
}

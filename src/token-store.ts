import { AsyncLocalStorage } from 'async_hooks';

/**
 * Holds the raw tenant-context token for the current request so services can
 * echo it back to core (within its TTL) when they need core-resident data
 * (e.g. the app's provisioned CustomRecords).
 */
export const tokenStore = new AsyncLocalStorage<{ token: string }>();

export function currentToken(): string {
  const t = tokenStore.getStore()?.token;
  if (!t) throw new Error('No tenant token in request context');
  return t;
}

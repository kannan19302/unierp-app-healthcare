import { Request } from 'express';
import { TenantContextClaims } from '@unerp/service-kit';

/** Request with the verified tenant context attached by the service-kit middleware. */
export interface TenantRequest extends Request {
  tenantContext: TenantContextClaims;
}

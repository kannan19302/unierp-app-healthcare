import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { hasScope } from '@unerp/service-kit';

const APP_SLUG = 'healthcare';
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Enforces the token's scopes per HTTP method: reads need "healthcare:read",
 * mutations need "healthcare:write". Core embeds these from the bundle manifest's
 * service.scopes (#1).
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const needed = READ_METHODS.has(req.method) ? APP_SLUG + ':read' : APP_SLUG + ':write';
    if (!hasScope(req.tenantContext, needed)) {
      throw new ForbiddenException('Missing required scope "' + needed + '"');
    }
    return true;
  }
}

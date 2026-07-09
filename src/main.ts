import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { tenantContextMiddleware } from '@unerp/service-kit';
import { AppModule } from './app.module';
import { tokenStore } from './token-store';
import { TENANT_TOKEN_HEADER } from '@unerp/service-kit';

const APP_SLUG = 'healthcare';
const HEALTH_PATH = '/svc/health';

async function bootstrap() {
  const secret = process.env.EXT_SERVICE_JWT_SECRET;
  if (!secret) throw new Error('EXT_SERVICE_JWT_SECRET must be set');

  const app = await NestFactory.create(AppModule);
  app.use(
    tenantContextMiddleware({
      secret,
      appSlug: APP_SLUG,
      publicPaths: [HEALTH_PATH],
    }),
  );
  app.use((req: any, _res: any, next: any) => tokenStore.run({ token: String(req.headers[TENANT_TOKEN_HEADER] || '') }, next));

  const port = Number(process.env.PORT) || 4104;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`unierp-app-healthcare service listening on :${port} (health at ${HEALTH_PATH})`);
}

bootstrap();

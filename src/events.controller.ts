import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { verifyWebhook, WEBHOOK_SIGNATURE_HEADER, WEBHOOK_TIMESTAMP_HEADER } from '@unerp/service-kit';

/**
 * Receives core domain-event webhooks (#6). Core signs each delivery with this
 * app's secret; we verify signature + timestamp before acting. Public path
 * (no tenant token) — trust comes from the signature.
 */
@Controller('events')
export class EventsController {
  @Post()
  handle(@Req() req: Request, @Res() res: Response) {
    const secret = process.env.EXT_SERVICE_JWT_SECRET || '';
    const raw = JSON.stringify(req.body ?? {});
    try {
      verifyWebhook(
        raw,
        String(req.headers[WEBHOOK_SIGNATURE_HEADER] || ''),
        String(req.headers[WEBHOOK_TIMESTAMP_HEADER] || ''),
        secret,
      );
    } catch (e: any) {
      return res.status(401).json({ error: 'invalid signature', message: e && e.message });
    }
    // eslint-disable-next-line no-console
    console.log('[event]', req.body && req.body.event, 'tenant', req.body && req.body.tenantId);
    return res.status(204).end();
  }
}

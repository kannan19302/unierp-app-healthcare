import { Controller, Get } from '@nestjs/common';
import { buildHealthResponse } from '@unerp/service-kit';

@Controller('svc')
export class HealthController {
  @Get('health')
  health() {
    return buildHealthResponse('healthcare', process.env.npm_package_version);
  }
}

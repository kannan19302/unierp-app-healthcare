import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { EventsController } from './events.controller';
import { HealthcareController } from './healthcare.controller';
import { ClinicalController } from './clinical.controller';
import { HealthcareSmartController } from './healthcare-smart.controller';
import { HealthcareService } from './healthcare.service';
import { ClinicalService } from './clinical.service';
import { HealthcareSmartService } from './healthcare-smart.service';

@Module({
  controllers: [HealthController, EventsController, HealthcareController, ClinicalController, HealthcareSmartController],
  providers: [HealthcareService, ClinicalService, HealthcareSmartService],
})
export class AppModule {}

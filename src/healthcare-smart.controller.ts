import { Controller, Get, Post, Query, Req, Body } from '@nestjs/common';
import { TenantRequest } from './tenant';
import { HealthcareSmartService } from './healthcare-smart.service';


/**
 * Smart Healthcare services (eligibility, claim scrubbing, drug interactions, CDS,
 * quality measures, FHIR read API) mounted under /api/v1/healthcare/*. Operates on the
 * Healthcare marketplace app's custom records.
 */
@Controller()
export class HealthcareSmartController {
  constructor(private readonly smart: HealthcareSmartService) {}
  @Post('eligibility/check')
  eligibility(@Req() req: TenantRequest, @Body() body: { patient_mrn: string }) {
    return this.smart.eligibilityCheck(req.tenantContext.tenantId, body);
  }
  @Post('claims/scrub')
  scrub(@Req() req: TenantRequest, @Body() body: any) {
    return this.smart.claimsScrub(req.tenantContext.tenantId, body);
  }
  @Post('rx/interactions')
  interactions(@Req() req: TenantRequest, @Body() body: { patient_mrn?: string; meds?: string[] }) {
    return this.smart.rxInteractions(req.tenantContext.tenantId, body);
  }
  @Post('cds/evaluate')
  cds(@Req() req: TenantRequest, @Body() body: { patient_mrn: string; order_drug?: string }) {
    return this.smart.cdsEvaluate(req.tenantContext.tenantId, body);
  }
  @Get('quality/measures')
  quality(@Req() req: TenantRequest) {
    return this.smart.qualityMeasures(req.tenantContext.tenantId);
  }
  @Get('fhir/Patient')
  fhirPatient(@Req() req: TenantRequest, @Query('mrn') mrn?: string) {
    return this.smart.fhirPatient(req.tenantContext.tenantId, mrn);
  }
  @Get('fhir/Observation')
  fhirObservation(@Req() req: TenantRequest, @Query('mrn') mrn?: string) {
    return this.smart.fhirObservation(req.tenantContext.tenantId, mrn);
  }
}

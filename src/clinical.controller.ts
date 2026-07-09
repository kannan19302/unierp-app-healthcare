import { Controller, Get, Post, Patch, Param, Req, Body } from '@nestjs/common';
import { TenantRequest } from './tenant';
import { ClinicalService } from './clinical.service';

@Controller('clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}
  @Get('patients/:patientId/summary')
  async getPatientSummary(@Req() req: TenantRequest, @Param('patientId') patientId: string) {
    await this.clinicalService.logPhiAccess(req.tenantContext.tenantId, req.tenantContext.userId, patientId, 'VIEW_SUMMARY');
    return this.clinicalService.getPatientSummary(req.tenantContext.tenantId, patientId);
  }
  @Post('encounters')
  async createEncounter(@Req() req: TenantRequest, @Body() body: any) {
    return this.clinicalService.createEncounterWithCharting(req.tenantContext.tenantId, body);
  }
  @Patch('encounters/:id/submit-claim')
  async submitClaim(@Req() req: TenantRequest, @Param('id') id: string) {
    return this.clinicalService.submitClaim(req.tenantContext.tenantId, id);
  }
  @Post('prescriptions')
  async createPrescription(@Req() req: TenantRequest, @Body() body: any) {
    return this.clinicalService.createPrescription(req.tenantContext.tenantId, body);
  }
  @Get('patients/:patientId/fhir')
  async exportFhir(@Req() req: TenantRequest, @Param('patientId') patientId: string) {
    await this.clinicalService.logPhiAccess(req.tenantContext.tenantId, req.tenantContext.userId, patientId, 'FHIR_EXPORT');
    return this.clinicalService.exportPatientFhirBundle(req.tenantContext.tenantId, patientId);
  }
}

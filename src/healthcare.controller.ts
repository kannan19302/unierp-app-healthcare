import { Controller, Get, Post, Req, Query, Body, UseGuards } from '@nestjs/common';
import { TenantRequest } from './tenant';
import { ScopeGuard } from './scope.guard';
import { HealthcareService } from './healthcare.service';


@UseGuards(ScopeGuard)
@Controller()
export class HealthcareController {
  constructor(private readonly service: HealthcareService) {}
  @Get('patients')
  async getPatients(
    @Req() req: TenantRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getPatients(req.tenantContext.tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sort,
      search,
    });
  }
  @Post('patients')
  async createPatient(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.createPatient(req.tenantContext.tenantId, dto);
  }
  @Get('practitioners')
  async getPractitioners(
    @Req() req: TenantRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.getPractitioners(req.tenantContext.tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sort,
    });
  }
  @Post('practitioners')
  async createPractitioner(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.createPractitioner(req.tenantContext.tenantId, dto);
  }
  @Get('appointments')
  async getAppointments(@Req() req: TenantRequest) {
    return this.service.getAppointments(req.tenantContext.tenantId);
  }
  @Post('appointments')
  async createAppointment(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.createAppointment(req.tenantContext.tenantId, dto);
  }
  @Get('prescriptions')
  async getPrescriptions(@Req() req: TenantRequest) {
    return this.service.getPrescriptions(req.tenantContext.tenantId);
  }
  @Post('prescriptions')
  async createPrescription(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.createPrescription(req.tenantContext.tenantId, dto);
  }
  @Get('drugs')
  async getDrugRegister(@Req() req: TenantRequest) {
    return this.service.getDrugRegister(req.tenantContext.tenantId);
  }
  @Post('drugs')
  async logDrugRegister(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.logDrugRegister(req.tenantContext.tenantId, dto);
  }
  @Get('encounters')
  async getMedicalEncounters(@Req() req: TenantRequest) {
    return this.service.getMedicalEncounters(req.tenantContext.tenantId);
  }
  @Post('encounters')
  async createMedicalEncounter(
    @Req() req: TenantRequest,
    @Body() dto: any
  ) {
    return this.service.createMedicalEncounter(req.tenantContext.tenantId, dto);
  }
}

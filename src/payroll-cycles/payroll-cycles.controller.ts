import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PayrollCyclesService } from './payroll-cycles.service';
import { CreatePayrollCycleDto } from './dto/create-payroll-cycle.dto';

@Controller('payroll-cycles')
export class PayrollCyclesController {
  constructor(private readonly payrollCyclesService: PayrollCyclesService) {}

  @Post()
  create(@Body() createPayrollCycleDto: CreatePayrollCycleDto) {
    return this.payrollCyclesService.create(createPayrollCycleDto);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.payrollCyclesService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollCyclesService.findOne(id);
  }
}

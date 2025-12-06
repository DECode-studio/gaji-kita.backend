import { Module } from '@nestjs/common';
import { PayrollCyclesService } from './payroll-cycles.service';
import { PayrollCyclesController } from './payroll-cycles.controller';

@Module({
  controllers: [PayrollCyclesController],
  providers: [PayrollCyclesService],
})
export class PayrollCyclesModule {}

import { Controller, Post, Param } from '@nestjs/common';
import { RepaymentsService } from './repayments.service';

@Controller('repayments')
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Post('process-cycle/:cycleId')
  processCycle(@Param('cycleId') cycleId: string) {
    return this.repaymentsService.processRepaymentsForCycle(cycleId);
  }
}

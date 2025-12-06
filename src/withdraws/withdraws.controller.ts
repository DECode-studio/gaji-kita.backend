import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { WithdrawsService } from './withdraws.service';
import { SimulateWithdrawDto } from './dto/simulate-withdraw.dto';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { ApproveWithdrawRequestDto } from './dto/approve-withdraw-request.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@Controller('withdraws')
@UseGuards(RolesGuard)
export class WithdrawsController {
  constructor(private readonly withdrawsService: WithdrawsService) {}

  @Get('simulate')
  @Roles(ROLES.EMPLOYEE)
  simulate(@Query() simulateDto: SimulateWithdrawDto, @Req() req) {
    if (req.user.id !== simulateDto.employee_id) {
      throw new ForbiddenException('You can only simulate for yourself.');
    }
    return this.withdrawsService.simulate(
      simulateDto.employee_id,
      simulateDto.payroll_cycle_id,
      simulateDto.requested_amount,
    );
  }

  @Post('request')
  @Roles(ROLES.EMPLOYEE)
  createRequest(@Body() createRequestDto: CreateWithdrawRequestDto, @Req() req) {
    if (req.user.id !== createRequestDto.employee_id) {
      throw new ForbiddenException('You can only request for yourself.');
    }
    return this.withdrawsService.createRequest(createRequestDto);
  }

  @Post(':id/execute')
  @Roles(ROLES.ADMIN)
  execute(
    @Param('id') id: string,
    @Body() approveDto: ApproveWithdrawRequestDto,
  ) {
    return this.withdrawsService.execute(
      id,
      approveDto.approved_amount,
      approveDto.extra_aave_fee,
    );
  }
}

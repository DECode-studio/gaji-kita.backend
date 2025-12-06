import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeesService } from '../fees/fees.service';
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto';
import { FUND_SOURCE_TYPE, WITHDRAW_STATUS } from '@prisma/client';

@Injectable()
export class WithdrawsService {
  constructor(
    private prisma: PrismaService,
    private feesService: FeesService,
  ) {}

  async simulate(
    employeeId: string,
    payrollCycleId: string,
    requestedAmount: number,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    const payrollCycle = await this.prisma.payrollCycle.findUnique({
      where: { id: payrollCycleId },
    });
    const withdrawLimit = await this.prisma.withdrawLimit.findUnique({
      where: {
        employee_id_payroll_cycle_id: { employee_id: employeeId, payroll_cycle_id: payrollCycleId },
      },
    });

    if (!employee || !payrollCycle || !withdrawLimit) {
      throw new NotFoundException('Data not found for simulation');
    }

    const maxPossible = withdrawLimit.remaining_amount.toNumber();
    if (requestedAmount > maxPossible) {
      throw new BadRequestException(
        `Requested amount exceeds maximum possible of ${maxPossible}`,
      );
    }
    
    const daysWorked = await this.prisma.employeeWorkLog.count({
        where: {
          employee_id: employeeId,
          payroll_cycle_id: payrollCycleId,
          approved_by_id: { not: null },
        },
      });

    const progressRatio = daysWorked / payrollCycle.total_working_days;

    const feeBreakdown = await this.feesService.calculateFee(
      employee.company_id,
      requestedAmount,
      progressRatio,
    );

    return {
      max_possible_withdraw: maxPossible,
      ...feeBreakdown,
    };
  }

  createRequest(createDto: CreateWithdrawRequestDto) {
    return this.prisma.withdrawRequest.create({
      data: {
        ...createDto,
        status: WITHDRAW_STATUS.PENDING,
      },
    });
  }

  async execute(requestId: string, approvedAmount: number, extraAaveFee: number = 0) {
    const request = await this.prisma.withdrawRequest.findUnique({
      where: { id: requestId },
      include: { employee: true, payroll_cycle: true },
    });

    if (!request) throw new NotFoundException('Withdraw request not found.');
    if (request.status !== WITHDRAW_STATUS.APPROVED) {
      throw new BadRequestException('Request is not in approved state.');
    }

    const lockPool = await this.prisma.companyLockPool.findFirst({
        where: { payroll_cycle_id: request.payroll_cycle_id }
    });

    if(!lockPool) throw new NotFoundException('Company lock pool not found');

    const sources = [];
    let remainingToFund = approvedAmount;
    
    // 1. Deduct from company lock pool
    const fromCompanyPool = Math.min(lockPool.available_amount.toNumber(), remainingToFund);

    if (fromCompanyPool > 0) {
        sources.push({
            source_type: FUND_SOURCE_TYPE.COMPANY_LOCK,
            amount: fromCompanyPool,
        });
        await this.prisma.companyLockPool.update({
            where: { id: lockPool.id },
            data: { available_amount: { decrement: fromCompanyPool } }
        });
        remainingToFund -= fromCompanyPool;
    }

    // 2. If insufficient, use AAVE
    if (remainingToFund > 0) {
        sources.push({
            source_type: FUND_SOURCE_TYPE.AAVE,
            amount: remainingToFund,
        });
    }

    // 3. Update withdraw request and create fund sources
    const updatedRequest = await this.prisma.withdrawRequest.update({
        where: { id: requestId },
        data: {
            status: WITHDRAW_STATUS.PAID, // Assuming transfer happens instantly
            approved_amount: approvedAmount,
            extra_liquidity_fee_amount: extraAaveFee,
            fund_sources: { create: sources }
        }
    });

    // 4. Update withdraw limit
    await this.prisma.withdrawLimit.update({
        where: {
            employee_id_payroll_cycle_id: {
                employee_id: request.employee_id,
                payroll_cycle_id: request.payroll_cycle_id,
            }
        },
        data: {
            used_amount: { increment: approvedAmount },
            remaining_amount: { decrement: approvedAmount }
        }
    });

    return updatedRequest;
  }
}

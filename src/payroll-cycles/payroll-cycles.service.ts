import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollCycleDto } from './dto/create-payroll-cycle.dto';

@Injectable()
export class PayrollCyclesService {
  constructor(private prisma: PrismaService) {}

  async create(createPayrollCycleDto: CreatePayrollCycleDto) {
    // 1. Get all active employees and the company details
    const company = await this.prisma.company.findUnique({
      where: { id: createPayrollCycleDto.company_id },
      include: {
        employees: {
          where: {
            deleted: false,
            // Assuming 'active' status means currently employed
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // 2. Sum the base_salary of all active employees
    const totalSalaryCycle = company.employees.reduce(
      (sum, emp) => sum + emp.base_salary.toNumber(),
      0,
    );

    // 3. Compute required_locked_amount
    const requiredLockedAmount =
      totalSalaryCycle * (company.min_lock_percentage.toNumber() / 100);

    // 4. Create payroll_cycle and company_lock_pool in a transaction
    const payrollCycle = await this.prisma.payrollCycle.create({
      data: {
        ...createPayrollCycleDto,
        company_lock_pools: {
          create: {
            company_id: company.id,
            required_locked_amount: requiredLockedAmount,
            actual_locked_amount: 0, // Initially 0 until company deposits
            available_amount: 0,
          },
        },
      },
      include: {
        company_lock_pools: true,
      },
    });

    return payrollCycle;
  }

  findAll(companyId: string) {
    return this.prisma.payrollCycle.findMany({
      where: { company_id: companyId },
    });
  }

  findOne(id: string) {
    return this.prisma.payrollCycle.findUnique({ where: { id } });
  }
}

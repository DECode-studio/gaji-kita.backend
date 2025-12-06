import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';

export class SimulateWithdrawDto {
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @IsUUID()
  @IsNotEmpty()
  payroll_cycle_id: string;

  @IsNumber()
  @IsNotEmpty()
  requested_amount: number;
}

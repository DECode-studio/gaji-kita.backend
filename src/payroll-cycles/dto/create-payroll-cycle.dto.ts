import { IsUUID, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreatePayrollCycleDto {
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @IsDateString()
  @IsNotEmpty()
  period_start: string;

  @IsDateString()
  @IsNotEmpty()
  period_end: string;

  @IsDateString()
  @IsNotEmpty()
  payout_date: string;

  @IsInt()
  @IsNotEmpty()
  total_working_days: number;
}

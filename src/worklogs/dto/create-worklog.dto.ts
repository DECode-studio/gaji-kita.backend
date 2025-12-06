import { IsUUID, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateWorklogDto {
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @IsUUID()
  @IsNotEmpty()
  payroll_cycle_id: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  hours_worked: number;
}

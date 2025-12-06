import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  company_id: string;

  @IsString()
  @IsOptional()
  employee_number?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  base_salary: number;

  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  sbt_token_id?: string;

  @IsDateString()
  @IsOptional()
  employed_started?: Date;

  @IsDateString()
  @IsOptional()
  employed_ended?: Date;
}

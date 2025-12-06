import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  min_lock_percentage: number;

  @IsNumber()
  fee_share_company: number;

  @IsNumber()
  fee_share_platform: number;
}

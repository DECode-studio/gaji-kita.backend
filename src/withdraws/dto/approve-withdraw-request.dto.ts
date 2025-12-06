import { IsNumber, IsOptional } from 'class-validator';

export class ApproveWithdrawRequestDto {
  @IsNumber()
  approved_amount: number;

  @IsNumber()
  @IsOptional()
  extra_aave_fee?: number;
}

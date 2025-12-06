import { IsUUID, IsNotEmpty } from 'class-validator';

export class ApproveWorklogDto {
  @IsUUID()
  @IsNotEmpty()
  approver_id: string;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class RejectRewardRequestDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

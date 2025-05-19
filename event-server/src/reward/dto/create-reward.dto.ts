import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RewardType } from '../reward.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  @ApiProperty({
    description: '연관된 이벤트 ID',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @ApiProperty({
    description: '리워드 타입',
    enum: RewardType,
    example: RewardType.POINT,
    required: true
  })
  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({
    description: '리워드 이름',
    example: '메소',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '리워드 수량',
    example: 1000,
    required: true,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

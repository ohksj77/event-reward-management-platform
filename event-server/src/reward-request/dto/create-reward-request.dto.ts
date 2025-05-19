import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardRequestDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '이벤트 ID',
    example: '507f1f77bcf86cd799439012',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @ApiProperty({
    description: '리워드 ID',
    example: '507f1f77bcf86cd799439013',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  rewardId: string;
}

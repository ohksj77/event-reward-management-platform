import { RewardRequestStatus } from '../reward-request.schema';
import { ApiProperty } from '@nestjs/swagger';

export class RewardRequestResponseDto {
  @ApiProperty({
    description: '리워드 요청 ID',
    example: '507f1f77bcf86cd799439014'
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '507f1f77bcf86cd799439011'
  })
  userId: string;

  @ApiProperty({
    description: '이벤트 ID',
    example: '507f1f77bcf86cd799439012'
  })
  eventId: string;

  @ApiProperty({
    description: '리워드 ID',
    example: '507f1f77bcf86cd799439013'
  })
  rewardId: string;

  @ApiProperty({
    description: '리워드 요청 상태',
    enum: RewardRequestStatus,
    example: RewardRequestStatus.PENDING
  })
  status: RewardRequestStatus;
}

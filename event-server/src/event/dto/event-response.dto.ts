import { EventType } from '../event.schema';
import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({
    description: '이벤트 ID',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: '이벤트 이름',
    example: '몬스터 사냥 이벤트'
  })
  name: string;

  @ApiProperty({
    description: '이벤트 타입',
    enum: EventType,
    example: EventType.HUNT
  })
  type: EventType;

  @ApiProperty({
    description: '이벤트 완료에 필요한 횟수',
    example: 1,
    minimum: 1
  })
  requiredCount: number;

  @ApiProperty({
    description: '이벤트 메타데이터 (추가 정보)',
    example: { description: '이벤트 설명', reward: '리워드 정보' }
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: '이벤트 종료 일시',
    example: '2024-12-31T23:59:59Z'
  })
  endDate: Date;
}

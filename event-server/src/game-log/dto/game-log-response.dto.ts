import { ApiProperty } from '@nestjs/swagger';
import { GameLogType } from '../game-log.schema';

export class GameLogResponseDto {
  @ApiProperty({
    description: '게임 로그 ID',
    example: '507f1f77bcf86cd799439017'
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '507f1f77bcf86cd799439011'
  })
  userId: string;

  @ApiProperty({
    description: '게임 로그 타입',
    enum: GameLogType,
    example: GameLogType.HUNT
  })
  type: string;
}

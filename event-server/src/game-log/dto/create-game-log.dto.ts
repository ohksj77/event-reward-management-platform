import { IsEnum, IsNotEmpty } from 'class-validator';
import { GameLogType } from '../game-log.schema';
import { ApiProperty } from '@nestjs/swagger';

export class MonsterMetadataDto {
  @ApiProperty({
    description: '몬스터 ID',
    example: '507f1f77bcf86cd799439015'
  })
  monsterId: string;

  @ApiProperty({
    description: '몬스터 이름',
    example: '드래곤'
  })
  monsterName: string;

  @ApiProperty({
    description: '몬스터 레벨',
    example: 10
  })
  monsterLevel: number;

  @ApiProperty({
    description: '몬스터 타입',
    example: '보스'
  })
  monsterType: string;

  @ApiProperty({
    description: '획득한 보상',
    example: 1000
  })
  reward: number;
}

export class InviteMetadataDto {
  @ApiProperty({
    description: '초대된 사용자 ID',
    example: '507f1f77bcf86cd799439016'
  })
  invitedUserId: string;

  @ApiProperty({
    description: '초대된 사용자 이름',
    example: '홍길동'
  })
  invitedUserName: string;
}

export class LoginMetadataDto {
  @ApiProperty({
    description: '로그인 시간',
    example: '2024-03-19T12:00:00Z'
  })
  loginTime: Date;
}

export class CreateGameLogDto {
  @ApiProperty({
    description: '게임 로그 타입',
    enum: GameLogType,
    example: GameLogType.HUNT,
    required: true
  })
  @IsNotEmpty()
  @IsEnum(GameLogType)
  type: GameLogType;

  @ApiProperty({
    description: '게임 로그 메타데이터',
    oneOf: [
      { $ref: '#/components/schemas/MonsterMetadataDto' },
      { $ref: '#/components/schemas/InviteMetadataDto' },
      { $ref: '#/components/schemas/LoginMetadataDto' }
    ],
    required: false
  })
  metadata?: Record<string, any>;
}

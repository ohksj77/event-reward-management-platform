import { UserRole } from '../../user/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: '사용자 ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: '로그인 ID', example: 'user@example.com' })
  loginId: string;

  @ApiProperty({ description: '닉네임', example: '홍길동' })
  nickname: string;

  @ApiProperty({ description: '역할', enum: UserRole, example: UserRole.USER })
  role: UserRole;
} 
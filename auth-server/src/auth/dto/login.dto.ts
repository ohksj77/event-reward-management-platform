import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '사용자 로그인 ID',
    example: 'user@example.com',
    required: true
  })
  @IsString()
  loginId: string;

  @ApiProperty({
    description: '사용자 비밀번호 (최소 6자)',
    example: 'password123',
    required: true,
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;
}

import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../constants/roles.constants';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '로그인 ID', example: 'user@example.com' })
  @IsString()
  loginId: string;

  @ApiProperty({ description: '비밀번호', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '닉네임', example: '홍길동' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '역할', enum: UserRole, example: UserRole.USER, required: false, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;  // 기본값은 USER
}

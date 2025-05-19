import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../constants/roles.constants';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRegisterDto {
  @ApiProperty({ description: '관리자 로그인 ID', example: 'admin@example.com' })
  @IsString()
  @IsEmail()
  loginId: string;

  @ApiProperty({ description: '비밀번호', example: 'admin1234', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '관리자 닉네임', example: '관리자' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '역할', enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;
}

import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../user.schema';

export class CreateUserDto {
  @IsString()
  loginId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nickname: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

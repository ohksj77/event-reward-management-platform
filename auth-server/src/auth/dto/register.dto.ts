import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  loginId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nickname: string;
}

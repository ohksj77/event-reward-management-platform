import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  loginId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nickname: string;
}

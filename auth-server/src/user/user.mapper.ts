import { User, UserRole } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';

export class UserMapper {
  static toEntity(createUserDto: CreateUserDto): Partial<User> {
    return {
      loginId: createUserDto.loginId,
      password: createUserDto.password,
      nickname: createUserDto.nickname,
      role: createUserDto.role || UserRole.USER
    };
  }

  static toResponseDto(user: User): UserResponseDto {
    return {
      _id: user._id?.toString(),
      loginId: user.loginId,
      nickname: user.nickname,
      role: user.role
    };
  }
}

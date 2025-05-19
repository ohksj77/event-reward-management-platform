import { User } from '../user/user.schema';
import { UserResponseDto } from './dto/user-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';

export class AuthMapper {
  static toUserResponse(user: User): UserResponseDto {
    return {
      _id: user._id?.toString(),
      loginId: user.loginId,
      nickname: user.nickname,
      role: user.role
    };
  }

  static toTokenResponse(tokens: { accessToken: string; refreshToken: string }): TokenResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }
}

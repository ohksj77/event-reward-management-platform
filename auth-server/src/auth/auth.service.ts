import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenDto } from './dto/auth.dto';
import { UserDocument } from '../user/user.schema';
import { AUTH_CONSTANTS } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const existingUser = await this.userService.findByLoginId(registerDto.loginId);
    if (existingUser) {
      throw new ConflictException(AUTH_CONSTANTS.ERROR_MESSAGES.DUPLICATE_LOGIN_ID);
    }

    return this.userService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByLoginId(loginDto.loginId);
    if (!user) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokens = this.tokenService.generateTokens(user);
    await this.tokenService.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.tokenService.verifyToken(refreshTokenDto.refreshToken);
      const token = await this.tokenService.findValidRefreshToken(refreshTokenDto.refreshToken, payload.sub);

      if (!token) {
        throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }

      await this.tokenService.invalidateRefreshToken(token._id.toString());
      
      const tokens = this.tokenService.generateTokens(user);
      await this.tokenService.saveRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(refreshToken: RefreshTokenDto) {
    try {
      const payload = this.tokenService.verifyToken(refreshToken.refreshToken);
      const token = await this.tokenService.findValidRefreshToken(refreshToken.refreshToken, payload.sub);

      if (token) {
        await this.tokenService.invalidateRefreshToken(token._id.toString());
      }

      return { message: AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGOUT };
    } catch (error) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }
}

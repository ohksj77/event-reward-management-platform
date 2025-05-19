import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenDto } from './dto/auth.dto';
import { User } from '../user/user.schema';
import { AUTH_CONSTANTS } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserMapper } from '../user/user.mapper';
import { AuthMapper } from './auth.mapper';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userService.findByLoginId(registerDto.loginId);
    if (existingUser) {
      throw new ConflictException(AUTH_CONSTANTS.ERROR_MESSAGES.DUPLICATE_LOGIN_ID);
    }
    const user = await this.userService.create(registerDto);
    return AuthMapper.toUserResponse(user);
  }

  async adminRegister(adminRegisterDto: AdminRegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userService.findByLoginId(adminRegisterDto.loginId);
    if (existingUser) {
      throw new ConflictException(AUTH_CONSTANTS.ERROR_MESSAGES.DUPLICATE_LOGIN_ID);
    }
    const user = await this.userService.create(adminRegisterDto);
    return AuthMapper.toUserResponse(user);
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
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

    return AuthMapper.toTokenResponse(tokens);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
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

      return AuthMapper.toTokenResponse(tokens);
    } catch (error) {
      throw new UnauthorizedException(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(refreshToken: RefreshTokenDto): Promise<{ message: string }> {
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

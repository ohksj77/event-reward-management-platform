import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { TokenRepository } from './token.repository';
import { AUTH_CONSTANTS } from '../auth/auth.constants';
import { JwtPayload } from './types';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  generateTokens(user: User) {
    const payload: JwtPayload = { 
      sub: user._id.toString(),
      username: user.loginId,
      role: user.role,
      iat: Date.now()
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_IN }),
    };
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_IN_MS);
    return this.tokenRepository.create({ 
      userId, 
      value: token,
      expiresAt 
    });
  }

  async findValidRefreshToken(token: string, userId: string) {
    return this.tokenRepository.findOne({
      value: token,
      userId,
      deletedAt: null
    });
  }

  async invalidateRefreshToken(tokenId: string) {
    return this.tokenRepository.updateOne(
      { _id: tokenId },
      { $set: { deletedAt: new Date() } }
    );
  }
}

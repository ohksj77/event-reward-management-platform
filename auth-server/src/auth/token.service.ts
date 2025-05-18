import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from './refresh-token.schema';
import { AUTH_CONSTANTS } from './auth.constants';
import { UserDocument } from '../user/user.schema';

interface JwtPayload {
  sub: string;
  loginId: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
  ) {}

  generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      loginId: user.loginId,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRES_IN 
    });
    const refreshToken = this.jwtService.sign(payload, { 
      expiresIn: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_IN 
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    return this.refreshTokenModel.create({
      value: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_IN_MS)
    });
  }

  async invalidateRefreshToken(tokenId: string) {
    return this.refreshTokenModel.findByIdAndUpdate(
      tokenId,
      { deletedAt: new Date() }
    );
  }

  async findValidRefreshToken(value: string, userId: string) {
    return this.refreshTokenModel.findOne({
      value,
      userId,
      deletedAt: null
    });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token) as JwtPayload;
  }
}

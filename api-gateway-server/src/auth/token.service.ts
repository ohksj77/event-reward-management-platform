import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONSTANTS } from './constants/auth.constants';

interface JwtPayload {
  sub: string;
  loginId: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateTokens(user: { _id: string; loginId: string; role: string }) {
    const payload: JwtPayload = {
      sub: user._id,
      loginId: user.loginId,
      role: user.role
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { 
        expiresIn: AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_IN 
      }),
    };
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token) as JwtPayload;
  }
} 
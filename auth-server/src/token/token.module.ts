import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema';
import { AUTH_CONSTANTS } from '../auth/auth.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: AUTH_CONSTANTS.JWT.SECRET,
      signOptions: { expiresIn: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRES_IN },
    }),
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {} 
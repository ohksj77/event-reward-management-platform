import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: AUTH_CONSTANTS.JWT.SECRET,
      signOptions: {
        expiresIn: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRES_IN,
      },
    }),
  ],
  providers: [JwtStrategy, RolesGuard],
  exports: [JwtStrategy, PassportModule, RolesGuard],
})
export class AuthModule {}

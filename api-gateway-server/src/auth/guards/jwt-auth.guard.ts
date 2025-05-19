import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    this.logger.debug(`Route is ${isPublic ? 'public' : 'protected'}`);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    this.logger.debug('Request details', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      authorization: authHeader
    });

    if (!authHeader) {
      this.logger.warn('No authorization header found');
      throw new UnauthorizedException('No authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid authorization header format', { authHeader });
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      return super.canActivate(context);
    } catch (error) {
      this.logger.error('Error in canActivate', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  handleRequest(err, user, info) {
    this.logger.debug('Token validation result', {
      error: err?.message,
      user: user ? { id: user.id, role: user.role } : null,
      info: info?.message,
      stack: err?.stack
    });

    if (err) {
      this.logger.error('Token validation failed', {
        error: err.message,
        stack: err.stack
      });
      throw new UnauthorizedException(err.message);
    }

    if (!user) {
      this.logger.warn('No user found in token');
      throw new UnauthorizedException('No user found in token');
    }

    return user;
  }
}

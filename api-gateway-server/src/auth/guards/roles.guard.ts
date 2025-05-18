import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ENDPOINT_PERMISSIONS } from '../constants/endpoints.constants';

const ERROR_MESSAGES = {
  NO_PERMISSION: '접근 권한이 없습니다.',
  AUTH_REQUIRED: '인증이 필요합니다.',
} as const;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const endpoint = `${method} ${path}`;

    const requiredRoles = ENDPOINT_PERMISSIONS[endpoint] || [];
    
    if (!requiredRoles) {
      throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    if (!request.user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const userRole = request.user.role;
    return requiredRoles.includes(userRole);
  }
}

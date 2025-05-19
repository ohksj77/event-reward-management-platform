import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ENDPOINT_PERMISSIONS } from '../constants/endpoints.constants';
import { match } from 'path-to-regexp';

const ENDPOINT_PATTERNS = Object.keys(ENDPOINT_PERMISSIONS);

function getEndpointKey(method: string, url: string): string | undefined {
  const path = url.split('?')[0].replace('/api/v1', '');
  console.log('Checking endpoint:', { method, path });
  
  for (const pattern of ENDPOINT_PATTERNS) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (patternMethod !== method) continue;
    
    const cleanPatternPath = patternPath.replace('/api/v1', '');
    const matcher = match(cleanPatternPath);
    
    if (matcher(path)) {
      console.log('Matched endpoint:', pattern);
      return pattern;
    }
  }
  console.log('No matching endpoint found');
  return undefined;
}

const ERROR_MESSAGES = {
  NO_PERMISSION: '접근 권한이 없습니다.',
  AUTH_REQUIRED: '인증이 필요합니다.',
} as const;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    console.log('RolesGuard checking:', { method, url });
    
    const endpoint = getEndpointKey(method, url);
    const requiredRoles = endpoint ? ENDPOINT_PERMISSIONS[endpoint] : [];
    
    console.log('Required roles:', requiredRoles);
    
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
    console.log('User role:', userRole);
    
    const hasPermission = requiredRoles.includes(userRole);
    if (!hasPermission) {
      throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
    }
    
    return true;
  }
}

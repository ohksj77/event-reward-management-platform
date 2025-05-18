import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../user/user.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user || !user.role) {
      return false;
    }

    // 로그인, 회원가입, 토큰 갱신은 모든 사용자 접근 가능
    const path = request.path;
    if (path === '/api/v1/auth/login' || 
        path === '/api/v1/auth/register' || 
        path === '/api/v1/auth/refresh') {
      return true;
    }

    // ADMIN은 모든 API에 접근 가능
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // OPERATOR는 이벤트와 리워드 생성 가능
    if (user.role === UserRole.OPERATOR) {
      return true;
    }

    // AUDITOR는 조회 API만 접근 가능
    if (user.role === UserRole.AUDITOR) {
      return request.method === 'GET';
    }

    // USER는 기본 API만 접근 가능
    if (user.role === UserRole.USER) {
      return !path.startsWith('/api/v1/events/create') && 
             !path.startsWith('/api/v1/rewards/create');
    }

    return false;
  }
} 
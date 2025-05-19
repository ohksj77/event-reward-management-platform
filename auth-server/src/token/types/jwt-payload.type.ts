export interface JwtPayload {
  sub: string;      // userId
  loginId: string;  // 로그인 ID
  role: string;     // 사용자 역할
  iat?: number;     // 토큰 발급 시간
  exp?: number;     // 토큰 만료 시간
}

export const AUTH_CONSTANTS = {
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key',
    ACCESS_TOKEN_EXPIRES_IN: '1h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    REFRESH_TOKEN_EXPIRES_IN_MS: 7 * 24 * 60 * 60 * 1000,
  },
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
    DUPLICATE_LOGIN_ID: '이미 존재하는 아이디입니다.',
    INVALID_REFRESH_TOKEN: '유효하지 않은 refreshToken입니다.',
  },
  SUCCESS_MESSAGES: {
    LOGOUT: '로그아웃되었습니다.',
  },
} as const;

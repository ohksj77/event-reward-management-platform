export const EVENT_ERROR_MESSAGES = {
  LOGIN_STREAK_EXCEEDED: '연속 출석 일 수가 최대치를 초과할 수 없습니다.',
  MONSTER_ID_REQUIRED: '사냥 이벤트에는 몬스터 ID가 필요합니다.',
  NOT_FOUND: '이벤트를 찾을 수 없습니다.',
} as const;

export const EVENT_DEFAULTS = {
  MAX_LOGIN_STREAK_DAYS: 7,
} as const;

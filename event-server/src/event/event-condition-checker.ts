import { Event, EventType } from './event.schema';
import { GameLogRepository } from '../game-log/game-log.repository';

export interface EventConditionChecker {
  checkCondition(event: Event, userId: string): Promise<boolean>;
}

export class LoginStreakChecker implements EventConditionChecker {
  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async checkCondition(event: Event, userId: string): Promise<boolean> {
    const requiredDays = event.requiredCount;
    const loginLogs = await this.gameLogRepository.findLoginStreak(userId, requiredDays);
    const loginDates = loginLogs.map(log => {
      const d = new Date(log.metadata?.loginTime);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
    const loginDateSet = new Set(loginDates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < requiredDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (!loginDateSet.has(checkDate.getTime())) {
        return false;
      }
    }
    return true;
  }
}

export class InviteLoginChecker implements EventConditionChecker {
  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async checkCondition(event: Event, userId: string): Promise<boolean> {
    const inviteLoginLogs = await this.gameLogRepository.findInviteLogins(userId);
    return inviteLoginLogs.length > 0;
  }
}

export class MonsterHuntChecker implements EventConditionChecker {
  constructor(private readonly gameLogRepository: GameLogRepository) {}

  async checkCondition(event: Event, userId: string): Promise<boolean> {
    const requiredCount = event.requiredCount;
    const monsterId = event.metadata?.monsterId;
    const huntLogs = await this.gameLogRepository.findMonsterHunts(userId, monsterId);
    return huntLogs.length >= requiredCount;
  }
}

export class EventCheckerFactory {
  private static instance: EventCheckerFactory;
  private checkers: Map<EventType, EventConditionChecker>;

  private constructor(private readonly gameLogRepository: GameLogRepository) {
    this.checkers = new Map<EventType, EventConditionChecker>([
      [EventType.STREAK, new LoginStreakChecker(gameLogRepository)],
      [EventType.INVITE, new InviteLoginChecker(gameLogRepository)],
      [EventType.HUNT, new MonsterHuntChecker(gameLogRepository)],
    ]);
  }

  static getInstance(gameLogRepository: GameLogRepository): EventCheckerFactory {
    if (!EventCheckerFactory.instance) {
      EventCheckerFactory.instance = new EventCheckerFactory(gameLogRepository);
    }
    return EventCheckerFactory.instance;
  }

  getChecker(event: Event): EventConditionChecker {
    const checker = this.checkers.get(event.type);
    if (!checker) {
      throw new Error(`Unsupported event type: ${event.type}`);
    }
    return checker;
  }
}

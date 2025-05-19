import { Test, TestingModule } from '@nestjs/testing';
import { GameLogService } from './game-log.service';
import { GameLogRepository } from './game-log.repository';
import { NotFoundException } from '@nestjs/common';
import { GameLog, GameLogType } from './game-log.schema';
import { Types } from 'mongoose';

describe('GameLogService', () => {
  let service: GameLogService;
  let repository: GameLogRepository;

  const mockGameLogRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findLoginStreak: jest.fn(),
    findMonsterHunts: jest.fn(),
    findInviteLogins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameLogService,
        {
          provide: GameLogRepository,
          useValue: mockGameLogRepository,
        },
      ],
    }).compile();

    service = module.get<GameLogService>(GameLogService);
    repository = module.get<GameLogRepository>(GameLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createGameLogDto = {
      userId: '507f1f77bcf86cd799439012',
      type: GameLogType.LOGIN,
      metadata: {
        loginStreakDays: 3,
      },
    };

    it('should create a game log successfully', async () => {
      const mockGameLog = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        user: '507f1f77bcf86cd799439012',
        type: GameLogType.LOGIN,
        metadata: {
          loginStreakDays: 3,
        },
        createdAt: new Date(),
      } as unknown as GameLog;
      mockGameLogRepository.create.mockResolvedValue(mockGameLog);

      const result = await service.create(createGameLogDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockGameLog._id.toString(),
        userId: mockGameLog.user,
        type: mockGameLog.type,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of game logs', async () => {
      const mockGameLogs = [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
          user: '507f1f77bcf86cd799439012',
          type: GameLogType.LOGIN,
          metadata: {
            loginStreakDays: 3,
          },
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
          user: '507f1f77bcf86cd799439012',
          type: GameLogType.HUNT,
          metadata: {
            monsterId: 'monster123',
          },
          createdAt: new Date(),
        },
      ] as unknown as GameLog[];

      mockGameLogRepository.findAll.mockResolvedValue(mockGameLogs);

      const result = await service.findAll(0, 20);

      expect(repository.findAll).toHaveBeenCalledWith(0, 20);
      expect(result).toEqual([
        {
          id: mockGameLogs[0]._id.toString(),
          userId: mockGameLogs[0].user,
          type: mockGameLogs[0].type,
        },
        {
          id: mockGameLogs[1]._id.toString(),
          userId: mockGameLogs[1].user,
          type: mockGameLogs[1].type,
        },
      ]);
    });
  });
});

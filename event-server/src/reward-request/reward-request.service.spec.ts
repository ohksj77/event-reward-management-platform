import { Test, TestingModule } from '@nestjs/testing';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestRepository } from './reward-request.repository';
import { EventService } from '../event/event.service';
import { GameLogRepository } from '../game-log/game-log.repository';
import { NotFoundException } from '@nestjs/common';
import { RewardRequest, RewardRequestStatus } from './reward-request.schema';
import { REWARD_REQUEST_ERROR_MESSAGES } from './reward-request.constants';
import { Event, EventType } from '../event/event.schema';
import { Types } from 'mongoose';

describe('RewardRequestService', () => {
  let service: RewardRequestService;
  let repository: RewardRequestRepository;
  let eventService: EventService;
  let gameLogRepository: GameLogRepository;

  const mockRewardRequestRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockEventService = {
    findOneEntity: jest.fn(),
  };

  const mockGameLogRepository = {
    findLoginStreak: jest.fn(),
    findMonsterHunts: jest.fn(),
    findInviteLogins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardRequestService,
        {
          provide: RewardRequestRepository,
          useValue: mockRewardRequestRepository,
        },
        {
          provide: EventService,
          useValue: mockEventService,
        },
        {
          provide: GameLogRepository,
          useValue: mockGameLogRepository,
        },
      ],
    }).compile();

    service = module.get<RewardRequestService>(RewardRequestService);
    repository = module.get<RewardRequestRepository>(RewardRequestRepository);
    eventService = module.get<EventService>(EventService);
    gameLogRepository = module.get<GameLogRepository>(GameLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createRewardRequestDto = {
      userId: '507f1f77bcf86cd799439012',
      eventId: '507f1f77bcf86cd799439011',
      rewardId: '507f1f77bcf86cd799439014',
    };

    it('should create a reward request for HUNT event and return PENDING status', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Monster Hunt Event',
        type: EventType.HUNT,
        userId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        requiredCount: 3,
        metadata: { monsterId: 'monster123' },
        endDate: new Date(),
      } as unknown as Event;

      const mockRewardRequest = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        user: new Types.ObjectId('507f1f77bcf86cd799439012'),
        event: new Types.ObjectId('507f1f77bcf86cd799439011'),
        reward: new Types.ObjectId('507f1f77bcf86cd799439014'),
        status: RewardRequestStatus.PENDING,
      } as RewardRequest;

      mockEventService.findOneEntity.mockResolvedValue(mockEvent);
      mockRewardRequestRepository.create.mockResolvedValue(mockRewardRequest);
      mockGameLogRepository.findMonsterHunts.mockResolvedValue([{ _id: '1' }, { _id: '2' }, { _id: '3' }, { _id: '4' }, { _id: '5' }]);

      const result = await service.create(createRewardRequestDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result.status).toBe(RewardRequestStatus.PENDING);
    });

    it('should create a reward request for INVITE event and return PENDING status', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Invite Event',
        type: EventType.INVITE,
        userId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        requiredCount: 2,
        metadata: { inviteCode: 'INVITE123' },
        endDate: new Date(),
      } as unknown as Event;

      const mockRewardRequest = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        user: new Types.ObjectId('507f1f77bcf86cd799439012'),
        event: new Types.ObjectId('507f1f77bcf86cd799439011'),
        reward: new Types.ObjectId('507f1f77bcf86cd799439014'),
        status: RewardRequestStatus.PENDING,
      } as RewardRequest;

      mockEventService.findOneEntity.mockResolvedValue(mockEvent);
      mockRewardRequestRepository.create.mockResolvedValue(mockRewardRequest);
      mockGameLogRepository.findInviteLogins.mockResolvedValue([{ _id: '1' }, { _id: '2' }, { _id: '3' }]);

      const result = await service.create(createRewardRequestDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result.status).toBe(RewardRequestStatus.PENDING);
    });

    it('should create a reward request for STREAK event and return PENDING status', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Login Streak Event',
        type: EventType.STREAK,
        userId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        requiredCount: 7,
        metadata: {},
        endDate: new Date(),
      } as unknown as Event;

      const mockRewardRequest = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        user: new Types.ObjectId('507f1f77bcf86cd799439012'),
        event: new Types.ObjectId('507f1f77bcf86cd799439011'),
        reward: new Types.ObjectId('507f1f77bcf86cd799439014'),
        status: RewardRequestStatus.PENDING,
      } as RewardRequest;

      mockEventService.findOneEntity.mockResolvedValue(mockEvent);
      mockRewardRequestRepository.create.mockResolvedValue(mockRewardRequest);
      mockGameLogRepository.findLoginStreak.mockResolvedValue([
        { _id: '1' }, { _id: '2' }, { _id: '3' }, { _id: '4' },
        { _id: '5' }, { _id: '6' }, { _id: '7' }, { _id: '8' },
        { _id: '9' }, { _id: '10' }
      ]);

      const result = await service.create(createRewardRequestDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result.status).toBe(RewardRequestStatus.PENDING);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventService.findOneEntity.mockResolvedValue(null);

      await expect(service.create(createRewardRequestDto)).rejects.toThrow(
        new NotFoundException(REWARD_REQUEST_ERROR_MESSAGES.EVENT_NOT_FOUND),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of reward requests', async () => {
      const mockRequests = [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
          user: new Types.ObjectId('507f1f77bcf86cd799439016'),
          event: new Types.ObjectId('507f1f77bcf86cd799439017'),
          reward: new Types.ObjectId('507f1f77bcf86cd799439018'),
          status: RewardRequestStatus.PENDING,
        },
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439019'),
          user: new Types.ObjectId('507f1f77bcf86cd799439020'),
          event: new Types.ObjectId('507f1f77bcf86cd799439021'),
          reward: new Types.ObjectId('507f1f77bcf86cd799439022'),
          status: RewardRequestStatus.APPROVED,
        },
      ] as RewardRequest[];

      mockRewardRequestRepository.findAll.mockResolvedValue(mockRequests);

      const result = await service.findAll(1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a reward request by id', async () => {
      const mockRequest = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439023'),
        user: new Types.ObjectId('507f1f77bcf86cd799439012'),
        event: new Types.ObjectId('507f1f77bcf86cd799439011'),
        reward: new Types.ObjectId('507f1f77bcf86cd799439014'),
        status: RewardRequestStatus.PENDING,
      } as RewardRequest;

      mockRewardRequestRepository.findById.mockResolvedValue(mockRequest);

      const result = await service.findOne('507f1f77bcf86cd799439023');

      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439023');
      expect(result.id).toBe('507f1f77bcf86cd799439023');
    });

    it('should throw NotFoundException when reward request not found', async () => {
      mockRewardRequestRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439023')).rejects.toThrow(
        new NotFoundException(REWARD_REQUEST_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });
});

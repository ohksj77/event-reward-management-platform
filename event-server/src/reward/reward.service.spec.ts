import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { RewardRepository } from './reward.repository';
import { NotFoundException } from '@nestjs/common';
import { Reward, RewardType } from './reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { REWARD_ERROR_MESSAGES } from './reward.constants';
import { Types } from 'mongoose';

describe('RewardService', () => {
  let service: RewardService;
  let repository: RewardRepository;

  const mockRewardRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: RewardRepository,
          useValue: mockRewardRepository,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    repository = module.get<RewardRepository>(RewardRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createRewardDto: CreateRewardDto = {
      name: 'Test Reward',
      type: RewardType.ITEM,
      amount: 100,
      eventId: '507f1f77bcf86cd799439011',
    };

    it('should create a reward successfully', async () => {
      const mockReward = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Reward',
        type: 'ITEM',
        amount: 100,
        event: '507f1f77bcf86cd799439011',
      };
      mockRewardRepository.create.mockResolvedValue(mockReward);

      const result = await service.create(createRewardDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual(mockReward);
    });
  });

  describe('findOne', () => {
    it('should return a reward by id', async () => {
      const mockReward = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Reward',
        type: 'ITEM',
        amount: 100,
        event: '507f1f77bcf86cd799439011',
      };
      mockRewardRepository.findById.mockResolvedValue(mockReward);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockReward);
    });

    it('should throw NotFoundException when reward not found', async () => {
      mockRewardRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        new NotFoundException(REWARD_ERROR_MESSAGES.NOT_FOUND),
      );
    });
  });
});

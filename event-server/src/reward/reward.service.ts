import { Injectable, NotFoundException } from '@nestjs/common';
import { RewardRepository } from './reward.repository';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardMapper } from './reward.mapper';
import { RewardResponseDto } from './dto/reward-response.dto';
import { REWARD_ERROR_MESSAGES } from './reward.constants';
import { Types } from 'mongoose';

@Injectable()
export class RewardService {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async create(createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
    const rewardData = RewardMapper.toEntity(createRewardDto);
    const reward = await this.rewardRepository.create(rewardData);
    return RewardMapper.toResponseDto(reward);
  }

  async findOne(id: string): Promise<RewardResponseDto> {
    const reward = await this.rewardRepository.findById(id);
    if (!reward) {
      throw new NotFoundException(REWARD_ERROR_MESSAGES.NOT_FOUND);
    }
    return RewardMapper.toResponseDto(reward);
  }
}

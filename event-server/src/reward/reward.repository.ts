import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward } from './reward.schema';

@Injectable()
export class RewardRepository {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
  ) {}

  async create(reward: Partial<Reward>): Promise<Reward> {
    const createdReward = new this.rewardModel(reward);
    return createdReward.save();
  }

  async findById(id: string): Promise<Reward> {
    return this.rewardModel
      .findById(id)
      .select('name description type value eventId')
      .lean()
      .exec();
  }
}

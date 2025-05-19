import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardRequest, RewardRequestStatus } from './reward-request.schema';

@Injectable()
export class RewardRequestRepository {
  constructor(
    @InjectModel(RewardRequest.name)
    private readonly rewardRequestModel: Model<RewardRequest>,
  ) {}

  async create(rewardRequest: Partial<RewardRequest>): Promise<RewardRequest> {
    const createdRewardRequest = new this.rewardRequestModel(rewardRequest);
    return createdRewardRequest.save();
  }

  async findAll(
    page: number,
    size: number,
    type?: string,
    target?: string,
  ): Promise<RewardRequest[]> {
    const query: any = {};
    if (type === 'STATUS' && target) {
      query.status = target;
    }

    return this.rewardRequestModel
      .find(query)
      .skip(page * size)
      .limit(size)
      .select('userId eventId rewardId status approvedBy rejectedReason createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<RewardRequest> {
    return this.rewardRequestModel
      .findById(id)
      .select('userId eventId rewardId status approvedBy rejectedReason createdAt')
      .lean()
      .exec();
  }

  async findByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestModel
      .find({ userId })
      .select('eventId rewardId status approvedBy rejectedReason createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async update(id: string, rewardRequest: Partial<RewardRequest>): Promise<RewardRequest> {
    return this.rewardRequestModel
      .findByIdAndUpdate(id, rewardRequest, { 
        new: true,
        lean: true
      })
      .exec();
  }

  async updateStatus(
    id: string,
    status: RewardRequestStatus,
    approvedBy?: string,
    rejectedReason?: string,
  ): Promise<RewardRequest> {
    const update: Partial<RewardRequest> = {
      status,
      ...(status === RewardRequestStatus.APPROVED && { approvedBy }),
      ...(status === RewardRequestStatus.REJECTED && { rejectedReason }),
    };
    return this.rewardRequestModel
      .findByIdAndUpdate(id, update, { 
        new: true,
        lean: true
      })
      .exec();
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<RewardRequest> {
    return this.rewardRequestModel.findOne({ user: userId, event: eventId }).exec();
  }
}

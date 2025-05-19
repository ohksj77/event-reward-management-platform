import { RewardRequest, RewardRequestStatus } from './reward-request.schema';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { RewardRequestResponseDto } from './dto/reward-request-response.dto';
import { Types } from 'mongoose';

export class RewardRequestMapper {
  static toEntity(createRewardRequestDto: CreateRewardRequestDto): Partial<RewardRequest> {
    return {
      user: new Types.ObjectId(createRewardRequestDto.userId),
      event: new Types.ObjectId(createRewardRequestDto.eventId),
      reward: new Types.ObjectId(createRewardRequestDto.rewardId),
      status: RewardRequestStatus.PENDING
    };
  }

  static toResponseDto(rewardRequest: RewardRequest): RewardRequestResponseDto {
    return {
      id: rewardRequest._id.toString(),
      userId: rewardRequest.user.toString(),
      eventId: rewardRequest.event.toString(),
      rewardId: rewardRequest.reward.toString(),
      status: rewardRequest.status
    };
  }

  static toResponseDtoArray(rewardRequests: RewardRequest[]): RewardRequestResponseDto[] {
    return rewardRequests.map(this.toResponseDto);
  }
}

import { Reward } from './reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardResponseDto } from './dto/reward-response.dto';
import { Types } from 'mongoose';

export class RewardMapper {
  static toEntity(createRewardDto: CreateRewardDto): Partial<Reward> {
    return {
      name: createRewardDto.name,
      type: createRewardDto.type,
      amount: createRewardDto.amount,
      event: new Types.ObjectId(createRewardDto.eventId),
    };
  }

  static toResponseDto(reward: Reward): RewardResponseDto {
    return {
      _id: reward._id.toString(),
      name: reward.name,
      type: reward.type,
      amount: reward.amount,
      event: reward.event.toString(),
    };
  }

  static toResponseDtoArray(rewards: Reward[]): RewardResponseDto[] {
    return rewards.map(this.toResponseDto);
  }
}

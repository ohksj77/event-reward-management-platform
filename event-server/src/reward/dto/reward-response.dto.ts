import { RewardType } from '../reward.schema';

export class RewardResponseDto {
  _id: string;
  name: string;
  type: RewardType;
  amount: number;
  event: string;
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Reward, RewardSchema } from './reward.schema';
import { RewardRepository } from './reward.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
  ],
  controllers: [RewardController],
  providers: [RewardService, RewardRepository],
  exports: [RewardService],
})
export class RewardModule {}

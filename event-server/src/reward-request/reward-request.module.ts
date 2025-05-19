import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardRequestController } from './reward-request.controller';
import { RewardRequestService } from './reward-request.service';
import { RewardRequestRepository } from './reward-request.repository';
import { RewardRequest, RewardRequestSchema } from './reward-request.schema';
import { GameLogModule } from '../game-log/game-log.module';
import { EventModule } from '../event/event.module';
import { RewardModule } from '../reward/reward.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
    GameLogModule,
    EventModule,
    RewardModule,
  ],
  controllers: [RewardRequestController],
  providers: [RewardRequestService, RewardRequestRepository],
  exports: [RewardRequestService],
})
export class RewardRequestModule {}

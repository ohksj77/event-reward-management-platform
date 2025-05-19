import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameLogController } from './game-log.controller';
import { GameLogService } from './game-log.service';
import { GameLogRepository } from './game-log.repository';
import { GameLog, GameLogSchema } from './game-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameLog.name, schema: GameLogSchema }]),
  ],
  controllers: [GameLogController],
  providers: [GameLogService, GameLogRepository],
  exports: [GameLogRepository],
})
export class GameLogModule {}

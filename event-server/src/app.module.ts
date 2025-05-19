import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './event/event.module';
import { RewardModule } from './reward/reward.module';
import { RewardRequestModule } from './reward-request/reward-request.module';
import { GameLogModule } from './game-log/game-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    EventModule,
    RewardModule,
    RewardRequestModule,
    GameLogModule,
  ],
})
export class AppModule {}

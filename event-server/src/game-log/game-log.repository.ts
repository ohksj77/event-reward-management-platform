import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameLog, GameLogType } from './game-log.schema';

@Injectable()
export class GameLogRepository {
  constructor(
    @InjectModel(GameLog.name) private readonly gameLogModel: Model<GameLog>,
  ) {}

  async create(gameLog: Partial<GameLog>): Promise<GameLog> {
    const createdGameLog = new this.gameLogModel(gameLog);
    return createdGameLog.save();
  }

  async findAll(page: number, size: number): Promise<GameLog[]> {
    return this.gameLogModel
      .find()
      .skip((page - 1) * size)
      .limit(size)
      .exec();
  }

  async findLoginStreak(userId: string, days: number): Promise<GameLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.gameLogModel
      .find({
        userId,
        type: GameLogType.LOGIN,
        'metadata.loginTime': { $gte: startDate }
      })
      .sort({ 'metadata.loginTime': 1 })
      .lean()
      .exec();
  }

  async findMonsterHunts(userId: string, monsterId: string): Promise<GameLog[]> {
    return this.gameLogModel
      .find({
        userId,
        type: GameLogType.HUNT,
        'metadata.monsterId': monsterId
      })
      .lean()
      .exec();
  }

  async findInviteLogins(userId: string): Promise<GameLog[]> {
    return this.gameLogModel
      .aggregate([
        {
          $match: {
            userId,
            type: GameLogType.INVITE
          }
        },
        {
          $project: {
            invitedUserId: '$metadata.invitedUserId'
          }
        },
        {
          $lookup: {
            from: 'gamelogs',
            let: { invitedUserId: '$invitedUserId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$invitedUserId'] },
                      { $eq: ['$type', GameLogType.LOGIN] }
                    ]
                  }
                }
              }
            ],
            as: 'loginLogs'
          }
        },
        {
          $unwind: '$loginLogs'
        },
        {
          $replaceRoot: { newRoot: '$loginLogs' }
        }
      ])
      .exec();
  }
}

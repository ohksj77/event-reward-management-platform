import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from './refresh-token.schema';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectModel(RefreshToken.name) private tokenModel: Model<RefreshTokenDocument>,
  ) {}

  async findOne(filter: FilterQuery<RefreshTokenDocument>): Promise<RefreshTokenDocument> {
    return this.tokenModel.findOne(filter).exec();
  }

  async create(tokenData: { userId: string; value: string; expiresAt: Date }): Promise<RefreshTokenDocument> {
    const token = new this.tokenModel(tokenData);
    return token.save();
  }

  async updateOne(
    filter: FilterQuery<RefreshTokenDocument>,
    update: UpdateQuery<RefreshTokenDocument>
  ): Promise<RefreshTokenDocument> {
    return this.tokenModel.findOneAndUpdate(filter, update).exec();
  }
}

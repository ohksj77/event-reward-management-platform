import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Document } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User & Document>,
  ) {}

  async findOne(filter: FilterQuery<User & Document>): Promise<User & Document> {
    return this.userModel.findOne(filter).exec();
  }

  async create(userData: Partial<User>): Promise<User & Document> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findById(id: string): Promise<User & Document> {
    return this.userModel.findById(id).exec();
  }
}

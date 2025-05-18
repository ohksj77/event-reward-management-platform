import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(filter: FilterQuery<UserDocument>): Promise<UserDocument> {
    return this.userModel.findOne(filter).exec();
  }

  async create(userData: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }
}

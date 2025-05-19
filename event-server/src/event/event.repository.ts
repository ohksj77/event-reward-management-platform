import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.schema';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  async create(event: Partial<Event>): Promise<Event> {
    const createdEvent = new this.eventModel(event);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findById(id: string): Promise<Event> {
    return this.eventModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Event>): Promise<Event> {
    return this.eventModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Event> {
    return this.eventModel
      .findByIdAndUpdate(
        id,
        { $set: { deletedAt: new Date() } },
        { new: true },
      )
      .exec();
  }
}

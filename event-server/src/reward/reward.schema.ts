import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum RewardType {
  POINT = 'POINT',
  ITEM = 'ITEM',
  COUPON = 'COUPON',
}

@Schema({ timestamps: true })
export class Reward extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: RewardType })
  type: RewardType;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event: Types.ObjectId;

  @Prop({ default: null, nullable: true })
  deletedAt?: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

RewardSchema.index({ event: 1 });

RewardSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

RewardSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

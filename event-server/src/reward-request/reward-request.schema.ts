import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RewardRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Schema({ timestamps: true })
export class RewardRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  event: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  reward: Types.ObjectId;

  @Prop({ type: String, enum: RewardRequestStatus, default: RewardRequestStatus.PENDING })
  status: RewardRequestStatus;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

RewardRequestSchema.index({ user: 1, event: 1 }, { unique: true });

RewardRequestSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

RewardRequestSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

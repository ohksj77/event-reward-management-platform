import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventType {
  HUNT = 'HUNT',
  INVITE = 'INVITE',
  STREAK = 'STREAK',
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: EventType })
  type: EventType;

  @Prop({ required: true })
  requiredCount: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: null, nullable: true })
  deletedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ endDate: 1 });

EventSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

EventSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

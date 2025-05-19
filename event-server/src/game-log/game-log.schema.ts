import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum GameLogType {
  HUNT = 'HUNT',
  INVITE = 'INVITE',
  LOGIN = 'LOGIN',
}

@Schema({ timestamps: true })
export class GameLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true, enum: GameLogType })
  type: GameLogType;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: null, nullable: true })
  deletedAt?: Date;
}

export const GameLogSchema = SchemaFactory.createForClass(GameLog);

GameLogSchema.index({ user: 1, type: 1 });
GameLogSchema.index({ type: 1, createdAt: -1 });

GameLogSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

GameLogSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

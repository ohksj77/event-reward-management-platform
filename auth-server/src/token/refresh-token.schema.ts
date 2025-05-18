import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken extends Document {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, expires: '7d' })
  expiresAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

RefreshTokenSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

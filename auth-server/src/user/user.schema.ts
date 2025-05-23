import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    loginId: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    nickname: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [String], default: [] })
    permissions: string[];

    @Prop({ default: null })
    deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ loginId: 1 }, { unique: true });

UserSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

UserSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

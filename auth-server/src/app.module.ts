import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/authdb',
            }),
        }),
        AuthModule,
        UserModule,
        TokenModule
    ],
})
export class AppModule {}

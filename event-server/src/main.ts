import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MonsterMetadataDto, InviteMetadataDto, LoginMetadataDto } from './game-log/dto/create-game-log.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({transform: true}));

  const config = new DocumentBuilder()
    .setTitle('Event Service API')
    .setDescription('이벤트 서비스 API 문서')
    .setVersion('1.0')
    .addTag('events', '이벤트 관련 API')
    .addTag('rewards', '리워드 관련 API')
    .addTag('reward-requests', '리워드 요청 관련 API')
    .addTag('game-logs', '게임 로그 관련 API')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [MonsterMetadataDto, InviteMetadataDto, LoginMetadataDto],
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3002);
}
bootstrap();

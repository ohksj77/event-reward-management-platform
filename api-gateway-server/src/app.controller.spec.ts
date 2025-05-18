import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './logger/logger.service';
import { Request } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        LoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://mock-url'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('forwardRequest', () => {
    it('should forward request to auth service', async () => {
      const mockResponse = { data: { message: 'success' } };
      jest.spyOn(appService, 'forwardRequest').mockResolvedValue(mockResponse);

      const mockRequest = {
        url: '/login',
        method: 'POST',
        headers: {},
      } as Request;

      const result = await appController.forwardRequest('auth', mockRequest, {});
      expect(result).toBe(mockResponse);
    });
  });
});

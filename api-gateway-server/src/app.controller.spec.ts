import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Request } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('forwardRequest', () => {
    it('should forward request to auth service', async () => {
      const mockBody = { test: 'data' };
      const mockRequest = {
        url: '/test',
        method: 'POST',
        headers: {},
      } as Request;
      jest.spyOn(appService, 'forwardRequest').mockResolvedValue({ success: true });
      
      const result = await appController.forwardRequest('auth', mockRequest, mockBody);
      expect(result).toEqual({ success: true });
    });
  });
});

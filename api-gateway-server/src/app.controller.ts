import { Controller, All, Body, Param, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @All(':service/*')
  async forwardRequest(
    @Param('service') service: string,
    @Req() request: Request,
    @Body() body: any,
  ) {
    const serviceUrlMap = {
      auth: this.configService.get<string>('AUTH_URL'),
      events: this.configService.get<string>('EVENT_URL'),
    };
    const serviceUrl = serviceUrlMap[service];
    if (!serviceUrl) {
      throw new Error('Service not found');
    }

    const targetUrl = serviceUrl + request.url;
    console.log(targetUrl);
    
    return this.appService.forwardRequest(
      targetUrl,
      request.method,
      body,
      request.headers,
    );
  }
}

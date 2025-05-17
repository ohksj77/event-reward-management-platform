import { Controller, All, Body, Headers, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All('*')
  async handleAllRequests(
    @Req() request: Request,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.appService.forwardRequest(
      request.path,
      request.method,
      body,
      headers,
    );
  }
}

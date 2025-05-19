import { Controller, All, Body, Param, Req, UseGuards, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  private readonly serviceUrlMap: Map<string, string>;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrlMap = new Map([
      ['auth', this.configService.get<string>('AUTH_URL')],
      ['events', this.configService.get<string>('EVENT_URL')],
      ['rewards', this.configService.get<string>('EVENT_URL')],
      ['reward-requests', this.configService.get<string>('EVENT_URL')],
    ]);
    console.log('Service URL Map:', Object.fromEntries(this.serviceUrlMap));
  }

  @Public()
  @Post('auth/register')
  async register(@Body() body: any) {
    const serviceUrl = this.configService.get<string>('AUTH_URL');
    return this.appService.forwardRequest(
      `${serviceUrl}/api/v1/auth/register`,
      'POST',
      body,
      {},
    );
  }

  @Public()
  @Post('auth/login')
  async login(@Body() body: any) {
    const serviceUrl = this.configService.get<string>('AUTH_URL');
    return this.appService.forwardRequest(
      `${serviceUrl}/api/v1/auth/login`,
      'POST',
      body,
      {},
    );
  }

  @Public()
  @Post('auth/admin/register')
  async adminRegister(@Body() body: any) {
    const serviceUrl = this.configService.get<string>('AUTH_URL');
    return this.appService.forwardRequest(
      `${serviceUrl}/api/v1/auth/admin/register`,
      'POST',
      body,
      {},
    );
  }

  @UseGuards(JwtAuthGuard)
  @All(':service/*')
  async forwardRequestWithPath(
    @Param('service') service: string,
    @Req() request: Request,
    @Body() body: any,
  ) {
    return this.forward(service, request, body);
  }

  @UseGuards(JwtAuthGuard)
  @All(':service')
  async forwardRequest(
    @Param('service') service: string,
    @Req() request: Request,
    @Body() body: any,
  ) {
    return this.forward(service.split('?')[0], request, body);
  }

  private forward(service: string, request, body: any) {
    const serviceUrl = this.serviceUrlMap.get(service);
    if (!serviceUrl) {
      throw new Error('Service not found');
    }

    const targetUrl = serviceUrl + request.url;
    const requestBody = body || {};

    const headers = { ...request.headers };
    
    delete headers.host;
    delete headers['content-length'];

    return this.appService.forwardRequest(
      targetUrl,
      request.method,
      requestBody,
      headers
    );
  }
}

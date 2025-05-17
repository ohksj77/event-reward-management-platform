import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async forwardRequest(path: string, method: string, body?: any, headers?: any) {
    const authUrl = this.configService.get<string>('AUTH_URL');
    const eventUrl = this.configService.get<string>('EVENT_URL');

    // 인증 관련 요청은 auth 서버로 전달
    if (path.startsWith('/auth')) {
      const response = await firstValueFrom(
        this.httpService.request({
          url: `${authUrl}${path}`,
          method,
          data: body,
          headers,
        }),
      );
      return response.data;
    }

    // 이벤트 관련 요청은 event 서버로 전달
    if (path.startsWith('/events')) {
      const response = await firstValueFrom(
        this.httpService.request({
          url: `${eventUrl}${path}`,
          method,
          data: body,
          headers,
        }),
      );
      return response.data;
    }

    throw new Error('Invalid path');
  }
}

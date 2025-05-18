import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async forwardRequest(url: string, method: string, body?: any, headers?: any) {
    const { host, 'content-length': _contentLength, ...safeHeaders } = headers || {};

    try {
      const config: any = {
        url,
        method,
        headers: {...safeHeaders},
        timeout: 10000,
      };
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = body ?? {};
        config.headers['content-type'] = 'application/json';
      }
      
      this.logger.logRequest(config);
      const response = await firstValueFrom(this.httpService.request(config));
      this.logger.logResponse(response);
      
      return response.data;
    } catch (error) {
      this.logger.logError(error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
}

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
    try {
      const requestHeaders = {
        'content-type': 'application/json',
      };

      if (headers?.authorization) {
        requestHeaders['authorization'] = headers.authorization;
      }

      Object.entries(headers || {}).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') {
          requestHeaders[key] = value;
        }
      });

      const config: any = {
        url,
        method,
        headers: requestHeaders,
        timeout: 10000,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = body;
      }
      
      const requestId = this.logger.logRequest(config);
      const response = await firstValueFrom(this.httpService.request(config));
      this.logger.logResponse(response, requestId);
      
      return response.data;
    } catch (error) {
      this.logger.logError(error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

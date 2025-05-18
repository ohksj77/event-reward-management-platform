import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/api-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
      silent: false,
      handleExceptions: true,
      handleRejections: true,
    });
  }

  async logRequest(config: AxiosRequestConfig) {
    return new Promise<void>((resolve) => {
      this.logger.info('API Request', {
        url: config.url,
        method: config.method,
        timestamp: new Date().toISOString(),
      }, () => resolve());
    });
  }

  async logResponse(response: AxiosResponse) {
    return new Promise<void>((resolve) => {
      this.logger.info('API Response', {
        url: response.config.url,
        status: response.status,
        timestamp: new Date().toISOString(),
      }, () => resolve());
    });
  }

  async logError(error: any) {
    return new Promise<void>((resolve) => {
      this.logger.error('API Error', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        timestamp: new Date().toISOString(),
      }, () => resolve());
    });
  }
}

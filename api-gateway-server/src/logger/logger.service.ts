import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

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
          maxSize: '200m',
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

  logRequest(config: AxiosRequestConfig): string {
    const requestId = uuidv4();
    setImmediate(() => {
      this.logger.info('API Request', {
        requestId,
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        timestamp: new Date().toISOString(),
      });
    });
    return requestId;
  }

  logResponse(response: AxiosResponse, requestId: string) {
    setImmediate(() => {
      this.logger.info('API Response', {
        requestId,
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString(),
      });
    });
  }

  logError(error: any) {
    const requestId = uuidv4();
    setImmediate(() => {
      this.logger.error('API Error', {
        requestId,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}

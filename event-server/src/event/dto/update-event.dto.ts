import { IsString, IsNumber, IsOptional, IsEnum, IsDate } from 'class-validator';
import { EventType } from '../event.schema';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsNumber()
  @IsOptional()
  requiredCount?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { EventMapper } from './event.mapper';
import { EventRepository } from './event.repository';
import { EventResponseDto } from './dto/event-response.dto';
import { EVENT_ERROR_MESSAGES, EVENT_DEFAULTS } from './event.constants';
import { EventType } from './event.schema';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    this.validateEvent(createEventDto);

    const event = await this.eventRepository.create({
      ...EventMapper.toEntity(createEventDto),
      type: createEventDto.type,
      requiredCount: createEventDto.requiredCount,
      metadata: createEventDto.metadata,
    });
    return EventMapper.toResponseDto(event);
  }

  validateEvent(createEventDto: CreateEventDto) {
    switch(createEventDto.type) {
      case EventType.STREAK:
        if (Number(createEventDto.metadata['streak']) > EVENT_DEFAULTS.MAX_LOGIN_STREAK_DAYS) {
          throw new Error(EVENT_ERROR_MESSAGES.LOGIN_STREAK_EXCEEDED);
        }
        break;
      case EventType.HUNT:
        if (!createEventDto.metadata['monsterId']) {
          throw new Error(EVENT_ERROR_MESSAGES.MONSTER_ID_REQUIRED);
        }
    }
  }

  async findAll(page: number = 0, size: number = 20): Promise<EventResponseDto[]> {
    const events = await this.eventRepository.findAll();
    return EventMapper.toResponseDtoArray(events);
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(EVENT_ERROR_MESSAGES.NOT_FOUND);
    }
    return EventMapper.toResponseDto(event);
  }

  async findOneEntity(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(EVENT_ERROR_MESSAGES.NOT_FOUND);
    }
    return event;
  }
}

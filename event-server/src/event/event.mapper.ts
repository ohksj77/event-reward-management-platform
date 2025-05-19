import { Event } from './event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';

export class EventMapper {
  static toEntity(createEventDto: CreateEventDto): Partial<Event> {
    return {
      name: createEventDto.name,
      type: createEventDto.type,
      requiredCount: createEventDto.requiredCount,
      metadata: createEventDto.metadata,
      endDate: createEventDto.endDate
    };
  }

  static toResponseDto(event: Event): EventResponseDto {
    return {
      _id: event._id.toString(),
      name: event.name,
      type: event.type,
      requiredCount: event.requiredCount,
      metadata: event.metadata,
      endDate: event.endDate
    };
  }

  static toResponseDtoArray(events: Event[]): EventResponseDto[] {
    return events.map(this.toResponseDto);
  }
}

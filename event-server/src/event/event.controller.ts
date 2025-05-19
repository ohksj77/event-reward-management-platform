import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '이벤트 생성', description: '새로운 이벤트를 생성합니다.' })
  @ApiResponse({ 
    status: 201, 
    description: '이벤트 생성 성공',
    type: EventResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 데이터' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  async create(@Body() createEventDto: CreateEventDto): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회', description: '페이지네이션된 이벤트 목록을 조회합니다.' })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: '페이지 번호 (0부터 시작)' 
  })
  @ApiQuery({ 
    name: 'size', 
    required: false, 
    type: Number, 
    description: '페이지당 항목 수' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '이벤트 목록 조회 성공',
    type: [EventResponseDto] 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  async findAll(
    @Query('page') page: number = 0,
    @Query('size') size: number = 20,
  ): Promise<EventResponseDto[]> {
    return this.eventService.findAll(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 상세 조회', description: '특정 이벤트의 상세 정보를 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '이벤트 상세 조회 성공',
    type: EventResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '이벤트를 찾을 수 없음' 
  })
  async findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventService.findOne(id);
  }
}

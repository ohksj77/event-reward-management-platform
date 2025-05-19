import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GameLogService } from './game-log.service';
import { CreateGameLogDto } from './dto/create-game-log.dto';
import { GameLogResponseDto } from './dto/game-log-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('game-logs')
@Controller('game-logs')
export class GameLogController {
  constructor(private readonly gameLogService: GameLogService) {}

  @Post()
  @ApiOperation({ summary: '게임 로그 생성', description: '새로운 게임 로그를 생성합니다.' })
  @ApiResponse({ 
    status: 201, 
    description: '게임 로그 생성 성공',
    type: GameLogResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 데이터' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  async create(@Body() createGameLogDto: CreateGameLogDto): Promise<GameLogResponseDto> {
    return this.gameLogService.create(createGameLogDto);
  }

  @Get()
  @ApiOperation({ summary: '게임 로그 목록 조회', description: '페이지네이션된 게임 로그 목록을 조회합니다.' })
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
    description: '게임 로그 목록 조회 성공',
    type: [GameLogResponseDto] 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  async findAll(
    @Query('page') page: number = 0,
    @Query('size') size: number = 20,
  ): Promise<GameLogResponseDto[]> {
    return this.gameLogService.findAll(page, size);
  }
}

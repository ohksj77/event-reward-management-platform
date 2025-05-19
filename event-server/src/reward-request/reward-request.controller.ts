import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { RewardRequestService } from './reward-request.service';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { RewardRequestResponseDto } from './dto/reward-request-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('reward-requests')
@Controller('reward-requests')
export class RewardRequestController {
  constructor(private readonly rewardRequestService: RewardRequestService) {}

  @Post()
  @ApiOperation({ summary: '리워드 요청 생성', description: '새로운 리워드 요청을 생성합니다.' })
  @ApiResponse({ 
    status: 201, 
    description: '리워드 요청 생성 성공',
    type: RewardRequestResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 데이터' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  create(@Body() createRewardRequestDto: CreateRewardRequestDto): Promise<RewardRequestResponseDto> {
    return this.rewardRequestService.create(createRewardRequestDto);
  }

  @Get()
  @ApiOperation({ summary: '리워드 요청 목록 조회', description: '페이지네이션된 리워드 요청 목록을 조회합니다.' })
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
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: '리워드 타입으로 필터링' 
  })
  @ApiQuery({ 
    name: 'target', 
    required: false, 
    type: String, 
    description: '대상 ID로 필터링' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '리워드 요청 목록 조회 성공',
    type: [RewardRequestResponseDto] 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  findAll(
    @Query('page') page: number = 0,
    @Query('size') size: number = 20,
    @Query('type') type?: string,
    @Query('target') target?: string,
  ): Promise<RewardRequestResponseDto[]> {
    return this.rewardRequestService.findAll(page, size, type, target);
  }

  @Get(':id')
  @ApiOperation({ summary: '리워드 요청 상세 조회', description: '특정 리워드 요청의 상세 정보를 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '리워드 요청 상세 조회 성공',
    type: RewardRequestResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '리워드 요청을 찾을 수 없음' 
  })
  findOne(@Param('id') id: string): Promise<RewardRequestResponseDto> {
    return this.rewardRequestService.findOne(id);
  }
}

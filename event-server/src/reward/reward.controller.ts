import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('rewards')
@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiOperation({ summary: '리워드 생성', description: '새로운 리워드를 생성합니다.' })
  @ApiResponse({ 
    status: 201, 
    description: '리워드 생성 성공',
    type: CreateRewardDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 데이터' 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardService.create(createRewardDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '리워드 상세 조회', description: '특정 리워드의 상세 정보를 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '리워드 상세 조회 성공',
    type: CreateRewardDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증되지 않은 요청' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '리워드를 찾을 수 없음' 
  })
  findOne(@Param('id') id: string) {
    return this.rewardService.findOne(id);
  }
}

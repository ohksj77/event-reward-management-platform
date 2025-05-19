import { Injectable, NotFoundException } from '@nestjs/common';
import { RewardRequest, RewardRequestStatus } from './reward-request.schema';
import { CreateRewardRequestDto } from './dto/create-reward-request.dto';
import { RewardRequestResponseDto } from './dto/reward-request-response.dto';
import { RewardRequestMapper } from './reward-request.mapper';
import { EventService } from '../event/event.service';
import { EventCheckerFactory } from '../event/event-condition-checker';
import { GameLogRepository } from '../game-log/game-log.repository';
import { RewardRequestRepository } from './reward-request.repository';
import { REWARD_REQUEST_ERROR_MESSAGES } from './reward-request.constants';
import { Event } from '../event/event.schema';

@Injectable()
export class RewardRequestService {
  private readonly eventCheckerFactory: EventCheckerFactory;

  constructor(
    private readonly rewardRequestRepository: RewardRequestRepository,
    private readonly eventService: EventService,
    private readonly gameLogRepository: GameLogRepository,
  ) {
    this.eventCheckerFactory = EventCheckerFactory.getInstance(gameLogRepository);
  }

  async create(createRewardRequestDto: CreateRewardRequestDto): Promise<RewardRequestResponseDto> {
    const { userId, eventId, rewardId } = createRewardRequestDto;

    const event = await this.eventService.findOneEntity(eventId);
    if (!event) {
      throw new NotFoundException(REWARD_REQUEST_ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    const rewardRequest = await this.rewardRequestRepository.create(
      RewardRequestMapper.toEntity({
        userId,
        eventId,
        rewardId
      })
    );

    this.checkEventCondition(event, userId, rewardRequest._id.toString()).catch(error => {
      console.error('Event condition check failed:', error);
    });

    return RewardRequestMapper.toResponseDto(rewardRequest);
  }

  private async checkEventCondition(event: Event, userId: string, rewardRequestId: string): Promise<void> {
    const checker = this.eventCheckerFactory.getChecker(event);
    const isSuccess = await checker.checkCondition(event, userId);

    if (!isSuccess) {
      await this.rewardRequestRepository.updateStatus(
        rewardRequestId,
        RewardRequestStatus.REJECTED
      );
    } else {
      await this.rewardRequestRepository.updateStatus(
        rewardRequestId,
        RewardRequestStatus.APPROVED
      );
    }
  }

  async findAll(page: number, size: number, type?: string, target?: string): Promise<RewardRequestResponseDto[]> {
    const rewardRequests = await this.rewardRequestRepository.findAll(page, size, type, target);
    return RewardRequestMapper.toResponseDtoArray(rewardRequests);
  }

  async findOne(id: string): Promise<RewardRequestResponseDto> {
    const rewardRequest = await this.rewardRequestRepository.findById(id);
    if (!rewardRequest) {
      throw new NotFoundException(REWARD_REQUEST_ERROR_MESSAGES.NOT_FOUND);
    }
    return RewardRequestMapper.toResponseDto(rewardRequest);
  }
}

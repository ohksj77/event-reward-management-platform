import { Injectable } from '@nestjs/common';
import { GameLog } from './game-log.schema';
import { CreateGameLogDto } from './dto/create-game-log.dto';
import { GameLogResponseDto } from './dto/game-log-response.dto';
import { GameLogRepository } from './game-log.repository';
import { GameLogMapper } from './game-log.mapper';

@Injectable()
export class GameLogService {
  constructor(
    private readonly gameLogRepository: GameLogRepository,
  ) {}

  async create(createGameLogDto: CreateGameLogDto): Promise<GameLogResponseDto> {
    const gameLog = await this.gameLogRepository.create(createGameLogDto);
    return GameLogMapper.toResponseDto(gameLog);
  }

  async findAll(page: number = 0, size: number = 20): Promise<GameLogResponseDto[]> {
    const gameLogs = await this.gameLogRepository.findAll(page, size);
    return GameLogMapper.toResponseDtoArray(gameLogs);
  }
}

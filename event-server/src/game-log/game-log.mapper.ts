import { GameLog } from './game-log.schema';
import { GameLogResponseDto } from './dto/game-log-response.dto';
import { CreateGameLogDto } from './dto/create-game-log.dto';

export class GameLogMapper {
  static toEntity(createGameLogDto: CreateGameLogDto): Partial<GameLog> {
    return {
      type: createGameLogDto.type,
      metadata: createGameLogDto.metadata,
    };
  }

  static toResponseDto(gameLog: GameLog): GameLogResponseDto {
    return {
      id: gameLog._id.toString(),
      userId: gameLog.user,
      type: gameLog.type,
    };
  }

  static toResponseDtoArray(gameLogs: GameLog[]): GameLogResponseDto[] {
    return gameLogs.map(this.toResponseDto);
  }
}

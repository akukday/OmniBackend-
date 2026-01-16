import { GameAttributes } from "../db/model/games";
import { GameRepository } from "../repository/games";
import { GameResponse } from "../common/model/games";

export class GameService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new GameService(schema);
  }

  /**
   * Transform DB model → API response
   */
  private transformResult(result: any): GameResponse {
    result = result?.dataValues as GameAttributes;
    return {
      id: result?.id ?? 0,
      code: result?.code ?? "",
      name: result?.name ?? "",
      description: result?.description ?? "",
      gameType: result?.gameType ?? "",
      minPlayers: result?.minPlayers ?? 2,
      maxPlayers: result?.maxPlayers ?? 20,
      maxRounds: result?.maxRounds ?? 0,
      iconUrl: result?.iconUrl ?? "",
      themeColor: result?.themeColor ?? ""
    };
  }

  /**
   * Get all active games (master data)
   */
  public async getAllActiveGames(): Promise<GameResponse[]> {
    const games = await GameRepository
      .withSchema(this.schema)
      .findAllActive();

    return games.map(game => this.transformResult(game));
  }

  /**
   * Get game by ID
   */
  public async getGameById(gameId: number): Promise<GameResponse | null> {
    const game = await GameRepository
      .withSchema(this.schema)
      .findById(gameId);

    return game ? this.transformResult(game) : null;
  }

  /**
   * Get game by unique code
   */
  public async getGameByCode(code: string): Promise<GameResponse | null> {
    const game = await GameRepository
      .withSchema(this.schema)
      .findByCode(code);

    return game ? this.transformResult(game) : null;
  }

  /**
   * Admin / Seed use – create game
   */
  public async createGame(game: Partial<GameAttributes>): Promise<GameResponse> {
    const createdGame = await GameRepository
      .withSchema(this.schema)
      .createGame(game as any);

    return this.transformResult(createdGame);
  }

  /**
   * Soft disable a game
   */
  public async deactivateGame(gameId: number): Promise<number> {
    return GameRepository
      .withSchema(this.schema)
      .deactivateGame(gameId);
  }
}

import { GameAttributes } from "../db/model/games";
import { GameRepository } from "../repository/games";
import { GameCategoryRepository } from "../repository/gameCategory";
import { GameResponse, GameCategoryResponse } from "../common/model/games";
import { GameCategoryAttributes } from "../db/model/gameCategory";

export class GameService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new GameService(schema);
  }

  /**
   * Transform DB model → API response
   */
  private transformResult(result: any, categories?: any[]): GameResponse {
    result = result?.dataValues as GameAttributes;
    const gameCategories: GameCategoryResponse[] | undefined = categories?.map(cat => {
      const catData = cat?.dataValues || cat;
      return {
        id: catData?.id,
        code: catData?.code,
        name: catData?.name,
        description: catData?.description
      };
    });
    
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
      themeColor: result?.themeColor ?? "",
      gameCategories: gameCategories
    };
  }

  /**
   * Get all active games (master data)
   */
  public async getAllActiveGames(): Promise<GameResponse[]> {
    const games = await GameRepository
      .withSchema(this.schema)
      .findAllActive();

    const gameResponses = await Promise.all(
      games.map(async (game) => {
        const categories = await GameCategoryRepository
          .withSchema(this.schema)
          .findByGame(game.dataValues.id, true);
        return this.transformResult(game, categories);
      })
    );

    return gameResponses;
  }

  /**
   * Get game by ID
   */
  public async getGameById(gameId: number): Promise<GameResponse | null> {
    const game = await GameRepository
      .withSchema(this.schema)
      .findById(gameId);

    if (!game) {
      return null;
    }

    const categories = await GameCategoryRepository
      .withSchema(this.schema)
      .findByGame(gameId, true);

    return this.transformResult(game, categories);
  }

  /**
   * Get game by unique code
   */
  public async getGameByCode(code: string): Promise<GameResponse | null> {
    const game = await GameRepository
      .withSchema(this.schema)
      .findByCode(code);

    if (!game) {
      return null;
    }

    const categories = await GameCategoryRepository
      .withSchema(this.schema)
      .findByGame(game.id, true);

    return this.transformResult(game, categories);
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

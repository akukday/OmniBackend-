import { ModelStatic, Op, Transaction } from "sequelize";
import { Game } from "../db/model/games";

export class GameRepository {
  private _gameRepo: ModelStatic<Game>;

  constructor(private schema: string) {
    this._gameRepo = Game.schema(schema);
  }

  static withSchema(schema: string) {
    return new GameRepository(schema);
  }

  /**
   * Find game by unique code (LULLABY, DIAPER_CAKE, etc.)
   */
  public async findByCode(code: string, t?: Transaction): Promise<Game | null> {
    return this._gameRepo.findOne({
      where: { code },
      transaction: t
    });
  }

  /**
   * Get all active games
   */
  public async findAllActive(t?: Transaction): Promise<Game[]> {
    return this._gameRepo.findAll({
      where: { isActive: true },
      order: [["id", "ASC"]],
      transaction: t
    });
  }

  /**
   * Get game by ID
   */
  public async findById(id: number, t?: Transaction): Promise<Game | null> {
    return this._gameRepo.findOne({
      where: { id },
      transaction: t
    });
  }

  /**
   * Create new game (admin / seed use)
   */
  public async createGame(game: Game, t?: Transaction): Promise<Game> {
    return this._gameRepo.create({ ...game }, { transaction: t });
  }

  /**
   * Soft disable a game
   */
  public async deactivateGame(id: number, t?: Transaction): Promise<number> {
    return this._gameRepo.update(
      { isActive: false },
      { where: { id }, transaction: t }
    ).then(([affectedRows]) => affectedRows);
  }
}

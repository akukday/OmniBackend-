import { ModelStatic, Op, Transaction } from "sequelize";
import { GameCategory } from "../db/model/gameCategory";

export class GameCategoryRepository {
  private _repo: ModelStatic<GameCategory>;

  constructor(private schema: string) {
    this._repo = GameCategory.schema(schema);
  }

  static withSchema(schema: string) {
    return new GameCategoryRepository(schema);
  }

  public async createCategory(
    category: Partial<GameCategory>
  ): Promise<GameCategory> {
    return this._repo.create(category as any);
  }

  public async findByGame(
    gameId: number,
    onlyActive = true,
    t?: Transaction
  ): Promise<GameCategory[]> {
    return this._repo.findAll({
      where: {
        gameId,
        ...(onlyActive ? { isActive: true } : {})
      },
      order: [["createdAt", "ASC"]],
      transaction: t
    });
  }

  public async findByCode(
    gameId: number,
    code: string
  ): Promise<GameCategory | null> {
    return this._repo.findOne({
      where: {
        gameId,
        code
      }
    });
  }

  public async disableCategory(
    id: number
  ): Promise<number> {
    const [count] = await this._repo.update(
      { isActive: false },
      { where: { id } }
    );
    return count;
  }
}

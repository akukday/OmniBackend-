import { ModelStatic, Op, QueryTypes, Transaction } from "sequelize";
import { Question } from "../db/model/question";

export class QuestionRepository {
  private _repo: ModelStatic<Question>;

  constructor(private schema: string) {
    this._repo = Question.schema(schema);
  }

  static withSchema(schema: string) {
    return new QuestionRepository(schema);
  }

  public async createQuestion(
    question: Question,
    t?: Transaction
  ): Promise<Question> {
    return this._repo.create({ ...question }, { transaction: t });
  }

  public async findByGame(
    gameId: number,
    t?: Transaction
  ): Promise<Question[]> {
    return this._repo.findAll({
      where: { gameId },
      order: [["id", "ASC"]],
      transaction: t
    });
  }

  public async findByGameAndCategories(gameId: number, categoryIds: number[], t?: Transaction): Promise<Question[]> {
    const sequelize = this._repo.sequelize;
    const placeholders = categoryIds.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      SELECT * FROM ${this.schema}.questions
      WHERE game_id = $${categoryIds.length + 1}
      AND category_id IN (${placeholders})
      ORDER BY id ASC
    `;

    try {
      const results = await sequelize?.query(query, {
        bind: [...categoryIds, gameId],
        type: QueryTypes.SELECT,
        transaction: t
      }) as any[];
      
      if (Array.isArray(results) && results.length > 0) {
        return results.map((row: any) => this._repo.build(row, { isNewRecord: false }));
      }
      return [];
    } catch (error: any) {
      throw error;
    }
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<Question | null> {
    return this._repo.findOne({ where: { id }, transaction: t });
  }

  public async deleteQuestion(
    id: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo.destroy({
      where: { id },
      cascade: true,
      transaction: t
    });
  }
}

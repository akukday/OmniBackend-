import { ModelStatic, Transaction } from "sequelize";
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

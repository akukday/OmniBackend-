import { ModelStatic, Transaction } from "sequelize";
import { Answer } from "../db/model/answer";

export class AnswerRepository {
  private _repo: ModelStatic<Answer>;

  constructor(private schema: string) {
    this._repo = Answer.schema(schema);
  }

  static withSchema(schema: string) {
    return new AnswerRepository(schema);
  }

  public async submitAnswer(
    payload: Answer,
    t?: Transaction
  ): Promise<Answer> {
    return this._repo.create({ ...payload }, { transaction: t });
  }

  public async findBySessionQuestion(
    sessionQuestionId: number,
    t?: Transaction
  ): Promise<Answer[]> {
    return this._repo.findAll({
      where: { sessionQuestionId },
      transaction: t
    });
  }

  public async findTeamAnswer(
    sessionQuestionId: number,
    teamId: number,
    t?: Transaction
  ): Promise<Answer | null> {
    return this._repo.findOne({
      where: { sessionQuestionId, teamId },
      transaction: t
    });
  }

  public async markCorrectness(
    id: number,
    isCorrect: boolean,
    t?: Transaction
  ): Promise<void> {
    await this._repo.update(
      { isCorrect },
      { where: { id }, transaction: t }
    );
  }
}

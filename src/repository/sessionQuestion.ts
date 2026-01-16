import { ModelStatic, Op, Transaction } from "sequelize";
import { SessionQuestion } from "../db/model/sessionQuestion";

export class SessionQuestionRepository {
  private _repo: ModelStatic<SessionQuestion>;

  constructor(private schema: string) {
    this._repo = SessionQuestion.schema(schema);
  }

  static withSchema(schema: string) {
    return new SessionQuestionRepository(schema);
  }

  public async create(
    payload: SessionQuestion,
    t?: Transaction
  ): Promise<SessionQuestion> {
    return this._repo.create({ ...payload }, { transaction: t });
  }

  public async findBySession(
    sessionId: number,
    t?: Transaction
  ): Promise<SessionQuestion[]> {
    return this._repo.findAll({
      where: { sessionId },
      order: [["roundNumber", "ASC"]],
      transaction: t
    });
  }

  public async findBySessionAndRound(
    sessionId: number,
    roundNumber: number,
    t?: Transaction
  ): Promise<SessionQuestion | null> {
    return this._repo.findOne({
      where: { sessionId, roundNumber },
      transaction: t
    });
  }

  public async markStarted(
    id: number,
    t?: Transaction
  ): Promise<void> {
    await this._repo.update(
      { startedAt: new Date() },
      { where: { id }, transaction: t }
    );
  }

  public async markEnded(
    id: number,
    t?: Transaction
  ): Promise<void> {
    await this._repo.update(
      { endedAt: new Date() },
      { where: { id }, transaction: t }
    );
  }

  public async deleteBySession(
    sessionId: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo.destroy({
      where: { sessionId },
      cascade: true,
      transaction: t
    });
  }
}

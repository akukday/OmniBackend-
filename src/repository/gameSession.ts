import { ModelStatic, Transaction } from "sequelize";
import { GameSession } from "../db/model/gameSession";

export class GameSessionRepository {
  private _repo: ModelStatic<GameSession>;

  constructor(private schema: string) {
    this._repo = GameSession.schema(schema);
  }

  static withSchema(schema: string) {
    return new GameSessionRepository(schema);
  }

  public async createSession(
    session: GameSession,
    t?: Transaction
  ): Promise<GameSession> {
    return this._repo.create({ ...session }, { transaction: t });
  }

  public async findByJoinCode(
    joinCode: string,
    t?: Transaction
  ): Promise<GameSession | null> {
    return this._repo.findOne({ where: { joinCode }, transaction: t });
  }

  public async startSession(
    sessionId: number,
    t: Transaction
  ): Promise<void> {
    await this._repo.update({ status: "ROUND_ACTIVE", currentRound: 1 },
      { where: { id: sessionId }, transaction: t }
    );
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<GameSession | null> {
    return this._repo.findOne({ where: { id }, transaction: t });
  }

  public async updateStatus(
    id: number,
    status: string,
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update({ status }, { where: { id }, transaction: t })
      .then(([count]) => count);
  }

  public async activateRound(
    sessionId: number,
    nextRound: number,
    t: Transaction
  ): Promise<void> {
    await this._repo.update(
      { currentRound: nextRound, status: "ROUND_ACTIVE" },
      { where: { id: sessionId }, transaction: t }
    );
  }

  public async endSession(
    id: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update(
        { status: "ROUND_ENDED", endedAt: new Date() },
        { where: { id }, transaction: t }
      )
      .then(([count]) => count);
  }

  public async completeSession(
    sessionId: number,
    t: Transaction
  ): Promise<void> {
    await this._repo.update(
      { status: "COMPLETED" },
      { where: { id: sessionId }, transaction: t }
    );
  }
}

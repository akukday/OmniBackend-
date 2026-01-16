import { GameSessionAttributes } from "../db/model/gameSession";
import { GameSessionRepository } from "../repository/gameSession";
import { randomBytes } from "crypto";

export interface GameSessionResponse {
  id: number;
  gameId: number;
  hostUserId: number;
  joinCode: string;
  status: string;
  currentRound: number;
  videoLink?: string;
}

export class GameSessionService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new GameSessionService(schema);
  }

  private generateJoinCode(): string {
    return randomBytes(4).toString("hex").toUpperCase(); // 8 chars
  }

  private transform(result: any): GameSessionResponse {
    result = result?.dataValues as GameSessionAttributes;
    return {
      id: result.id,
      gameId: result.gameId,
      hostUserId: result.hostUserId,
      joinCode: result.joinCode,
      status: result.status,
      currentRound: result.currentRound ?? 0,
      videoLink: result.videoLink
    };
  }

  public async createSession(
    gameId: number,
    hostUserId: string
  ): Promise<GameSessionResponse> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .createSession({
        gameId,
        hostUserId,
        joinCode: this.generateJoinCode(),
        status: "CREATED"
      } as any);

    return this.transform(session);
  }

  public async joinByCode(joinCode: string): Promise<GameSessionResponse> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .findByJoinCode(joinCode);

    if (!session) {
      throw new Error("Invalid join code");
    }

    return this.transform(session);
  }

  public async endSession(sessionId: number): Promise<void> {
    await GameSessionRepository
      .withSchema(this.schema)
      .endSession(sessionId);
  }
}

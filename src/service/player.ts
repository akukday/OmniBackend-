import { PlayerAttributes } from "../db/model/player";
import { PlayerRepository } from "../repository/player";

export interface PlayerResponse {
  id: number;
  sessionId: number;
  teamId?: number;
  userId?: string;
  name: string;
  isGuest: boolean;
}

export class PlayerService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new PlayerService(schema);
  }

  private transform(result: any): PlayerResponse {
    result = result?.dataValues as PlayerAttributes;
    return {
      id: result.id,
      sessionId: result.sessionId,
      teamId: result.teamId,
      userId: result.userId,
      name: result.name,
      isGuest: result.isGuest ?? true
    };
  }

  public async joinSession(payload: {
    sessionId: number;
    name: string;
    teamId?: number;
    userId?: number;
  }): Promise<PlayerResponse> {
    const player = await PlayerRepository
      .withSchema(this.schema)
      .createPlayer({
        sessionId: payload.sessionId,
        name: payload.name,
        teamId: payload.teamId,
        userId: payload.userId,
        isGuest: !payload.userId
      } as any);

    return this.transform(player);
  }

  public async getPlayersBySession(
    sessionId: number
  ): Promise<PlayerResponse[]> {
    const players = await PlayerRepository
      .withSchema(this.schema)
      .findBySession(sessionId);

    return players.map(p => this.transform(p));
  }

  public async assignTeam(
    playerId: number,
    teamId: number
  ): Promise<void> {
    await PlayerRepository
      .withSchema(this.schema)
      .updateTeam(playerId, teamId);
  }

  public async removePlayer(playerId: number): Promise<void> {
    await PlayerRepository
      .withSchema(this.schema)
      .deletePlayer(playerId);
  }
}

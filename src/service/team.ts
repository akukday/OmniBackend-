import { TeamAttributes } from "../db/model/team";
import { TeamRepository } from "../repository/team";

export interface TeamResponse {
  id: number;
  sessionId: number;
  name: string;
  score: number;
}

export class TeamService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new TeamService(schema);
  }

  private transform(result: any): TeamResponse {
    result = result?.dataValues as TeamAttributes;
    return {
      id: result.id,
      sessionId: result.sessionId,
      name: result.name,
      score: result.score ?? 0
    };
  }

  public async createTeam(
    sessionId: number,
    name: string
  ): Promise<TeamResponse> {
    const team = await TeamRepository
      .withSchema(this.schema)
      .createTeam({ sessionId, name } as any);

    return this.transform(team);
  }

  public async getTeamsBySession(sessionId: number): Promise<TeamResponse[]> {
    const teams = await TeamRepository
      .withSchema(this.schema)
      .findBySession(sessionId);

    return teams.map(t => this.transform(t));
  }

  public async findTeamWithLeastPlayers(sessionId: number): Promise<TeamResponse> {
    const team = await TeamRepository
      .withSchema(this.schema)
      .findTeamWithLeastPlayers(sessionId);

    return this.transform(team);
  }

  public async updateScore(teamId: number, score: number): Promise<void> {
    await TeamRepository
      .withSchema(this.schema)
      .updateScore(teamId, score);
  }

  public async deleteTeam(teamId: number): Promise<void> {
    await TeamRepository
      .withSchema(this.schema)
      .deleteTeam(teamId);
  }
}

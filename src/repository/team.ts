import { ModelStatic, Sequelize, Transaction } from "sequelize";
import { Team } from "../db/model/team";
import { Player } from "../db/model/player";

export class TeamRepository {
  private _repo: ModelStatic<Team>;

  constructor(private schema: string) {
    this._repo = Team.schema(schema);
  }

  static withSchema(schema: string) {
    return new TeamRepository(schema);
  }

  public async createTeam(
    team: Team,
    t?: Transaction
  ): Promise<Team> {
    return this._repo.create({ ...team }, { transaction: t });
  }

  public async findBySession(
    sessionId: number,
    t?: Transaction
  ): Promise<Team[]> {
    return this._repo.findAll({
      where: { sessionId },
      order: [["id", "ASC"]],
      transaction: t
    });
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<Team | null> {
    return this._repo.findOne({ where: { id }, transaction: t });
  }

  public async updateScore(
    teamId: number,
    score: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update({ score }, { where: { id: teamId }, transaction: t })
      .then(([count]) => count);
  }

  public async deleteTeam(
    teamId: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo.destroy({
      where: { id: teamId },
      cascade: true,
      transaction: t
    });
  }

  public async findTeamWithLeastPlayers(sessionId: number): Promise<Team | null> {
    return this._repo.findOne({
      where: { sessionId },
      include: [
        {
          model: Player.schema(this.schema),
          as: "players",
          attributes: [],
          required: false
        }
      ],
      group: ["Team.id"],
      order: [[Sequelize.literal("COUNT(players.id)"), "ASC"]],
      subQuery: false
    });
  }
}

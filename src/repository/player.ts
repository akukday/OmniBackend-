import { ModelStatic, Transaction } from "sequelize";
import { Player } from "../db/model/player";

export class PlayerRepository {
  private _repo: ModelStatic<Player>;

  constructor(private schema: string) {
    this._repo = Player.schema(schema);
  }

  static withSchema(schema: string) {
    return new PlayerRepository(schema);
  }

  public async createPlayer(
    player: Player,
    t?: Transaction
  ): Promise<Player> {
    return this._repo.create({ ...player }, { transaction: t });
  }

  public async findBySession(
    sessionId: number,
    t?: Transaction
  ): Promise<Player[]> {
    return this._repo.findAll({
      where: { sessionId },
      order: [["joinedAt", "ASC"]],
      transaction: t
    });
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<Player | null> {
    return this._repo.findOne({ where: { id }, transaction: t });
  }

  public async updateTeam(
    playerId: number,
    teamId: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update({ teamId }, { where: { id: playerId }, transaction: t })
      .then(([count]) => count);
  }

  public async deletePlayer(
    playerId: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo.destroy({
      where: { id: playerId },
      cascade: true,
      transaction: t
    });
  }
}

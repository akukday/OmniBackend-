import { ModelStatic, Op, Transaction } from "sequelize";
import { Invite } from "../db/model/invite";

export class InviteRepository {
  private _repo: ModelStatic<Invite>;

  constructor(private schema: string) {
    this._repo = Invite.schema(schema);
  }

  static withSchema(schema: string) {
    return new InviteRepository(schema);
  }

  public async createInvite(
    invite: Invite,
    t?: Transaction
  ): Promise<Invite> {
    return this._repo.create({ ...invite }, { transaction: t });
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<Invite | null> {
    return this._repo.findOne({ where: { id }, transaction: t });
  }

  public async findBySession(
    sessionId: number,
    t?: Transaction
  ): Promise<Invite[]> {
    return this._repo.findAll({
      where: { sessionId },
      order: [["createdAt", "DESC"]],
      transaction: t
    });
  }

  public async markUsed(
    ids: number[],
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update(
        { status: "USED", usedAt: new Date() },
        { where: { id: { [Op.in]: ids} }, transaction: t }
      )
      .then(([count]) => count);
  }

  public async expireInvite(
    id: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo
      .update(
        { status: "EXPIRED" },
        { where: { id }, transaction: t }
      )
      .then(([count]) => count);
  }

  public async bulkCreateInvites(
    invites: Partial<Invite>[],
    t?: Transaction
  ): Promise<Invite[]> {
    return this._repo.bulkCreate(invites as any[], {
      ignoreDuplicates: true,
      transaction: t
    });
  }
  
}

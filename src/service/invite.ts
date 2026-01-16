import { InviteAttributes } from "../db/model/invite";
import { InviteRepository } from "../repository/invite";

export interface InviteResponse {
  id: number;
  sessionId: number;
  email?: string;
  mobile?: string;
  invitedName?: string;
  status: string;
  expiresAt?: Date;
}

export class InviteService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new InviteService(schema);
  }

  private transform(result: any): InviteResponse {
    result = result?.dataValues as InviteAttributes;
    return {
      id: result.id,
      sessionId: result.sessionId,
      email: result.email,
      mobile: result.mobile,
      invitedName: result.invitedName,
      status: result.status ?? "SENT",
      expiresAt: result.expiresAt
    };
  }

  public async createInvite(
    sessionId: number,
    payload: {
      email?: string;
      mobile?: string;
      invitedName?: string;
      expiresAt?: Date;
    }
  ): Promise<InviteResponse> {
    if (!payload.email && !payload.mobile) {
      throw new Error("Email or mobile is required");
    }

    const invite = await InviteRepository
      .withSchema(this.schema)
      .createInvite({
        sessionId,
        ...payload,
        status: "SENT"
      } as any);

    return this.transform(invite);
  }

  public async getInvitesBySession(
    sessionId: number
  ): Promise<InviteResponse[]> {
    const invites = await InviteRepository
      .withSchema(this.schema)
      .findBySession(sessionId);

    return invites.map(i => this.transform(i));
  }

  public async markInviteUsed(inviteId: number): Promise<void> {
    await InviteRepository
      .withSchema(this.schema)
      .markUsed(inviteId);
  }
}

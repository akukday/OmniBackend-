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
    invites: string
  ): Promise<InviteResponse[]> {
    if (!invites || invites.trim().length === 0) {
      throw new Error("Email or mobile is required");
    }
  
    const values = invites
      .split(",")
      .map(v => v.trim())
      .filter(v => v.length > 0);
  
    if (values.length === 0) {
      throw new Error("Invalid invite list");
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    const payloads = values.map(value => {
      if (emailRegex.test(value)) {
        return {
          sessionId,
          email: value.toLowerCase(),
          status: "SENT"
        };
      }
  
      // Everything else → mobile
      return {
        sessionId,
        mobile: value,
        status: "SENT"
      };
    });
  
    const createdInvites = await InviteRepository
      .withSchema(this.schema)
      .bulkCreateInvites(payloads as any[]);
  
    return createdInvites.map(invite => this.transform(invite));
  }

  public async getInvitesBySession(
    sessionId: number
  ): Promise<InviteResponse[]> {
    const invites = await InviteRepository
      .withSchema(this.schema)
      .findBySession(sessionId);

    return invites.map(i => this.transform(i));
  }

  public async markInviteUsed(inviteIds: number[]): Promise<void> {
    await InviteRepository
      .withSchema(this.schema)
      .markUsed(inviteIds);
  }
}

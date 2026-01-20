import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface InviteAttributes {
  id: number;
  sessionId: number;
  email?: string;
  mobile?: string;
  invitedName?: string;
  status?: string;
  expiresAt?: Date;
  usedAt?: Date;
  createdAt?: Date;
}

/**
 * Creation attributes
 */
export type InviteCreationAttributes = Optional<
  InviteAttributes,
  "id" | "status" | "expiresAt" | "usedAt" | "createdAt"
>;

export class Invite extends Model<InviteAttributes, InviteCreationAttributes> implements InviteAttributes
{
  public id!: number;
  public sessionId!: number;
  public email?: string;
  public mobile?: string;
  public invitedName?: string;
  public status?: string; // SENT | USED | EXPIRED | REVOKED
  public expiresAt?: Date;
  public usedAt?: Date;
  public createdAt?: Date;
}

Invite.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: DataTypes.BIGINT,
      field: "session_id",
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    invitedName: {
      type: DataTypes.STRING(100),
      field: "invited_name",
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "SENT"
    },
    expiresAt: {
      type: DataTypes.DATE,
      field: "expires_at",
      allowNull: true
    },
    usedAt: {
      type: DataTypes.DATE,
      field: "used_at",
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "invites",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["session_id", "email"]
      },
      {
        unique: true,
        fields: ["session_id", "mobile"]
      }
    ]
  }
);

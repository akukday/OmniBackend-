import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";
import { Team } from "./team";

/**
 * DB attributes
 */
export interface PlayerAttributes {
  id: number;
  sessionId: number;
  teamId?: number;
  userId?: string;
  name: string;
  isGuest?: boolean;
  joinedAt?: Date;
}

/**
 * Creation attributes
 */
export type PlayerCreationAttributes = Optional<
  PlayerAttributes,
  "id" | "teamId" | "userId" | "isGuest" | "joinedAt"
>;

export class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes
{
  public id!: number;
  public sessionId!: number;
  public teamId?: number;
  public userId?: string;
  public name!: string;
  public isGuest?: boolean;
  public joinedAt?: Date;
}

Player.init(
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
    teamId: {
      type: DataTypes.BIGINT,
      field: "team_id",
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING,
      field: "user_id",
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isGuest: {
      type: DataTypes.BOOLEAN,
      field: "is_guest",
      defaultValue: true
    },
    joinedAt: {
      type: DataTypes.DATE,
      field: "joined_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "players",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["session_id", "name"]
      }
    ]
  }
);

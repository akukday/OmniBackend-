import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface GameSessionAttributes {
  id: number;
  gameId: number;
  hostUserId: string;
  joinCode: string;
  status: string;
  currentRound?: number;
  videoLink?: string;
  createdAt?: Date;
  endedAt?: Date;
}

/**
 * Creation attributes
 */
export type GameSessionCreationAttributes = Optional<
  GameSessionAttributes,
  "id" | "videoLink" | "createdAt" | "endedAt"
>;

export class GameSession
  extends Model<GameSessionAttributes, GameSessionCreationAttributes>
  implements GameSessionAttributes
{
  public id!: number;
  public gameId!: number;
  public hostUserId!: string;
  public joinCode!: string;
  public currentRound?: number;
  public status!: string; //CREATED → LOBBY → STARTED → ROUND_ACTIVE → COMPLETED
  public videoLink?: string;
  public createdAt?: Date;
  public endedAt?: Date;
}

GameSession.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    gameId: {
      type: DataTypes.SMALLINT,
      field: "game_id",
      allowNull: false
    },
    hostUserId: {
      type: DataTypes.STRING,
      field: "host_user_id",
      allowNull: false
    },
    joinCode: {
      type: DataTypes.STRING(8),
      field: "join_code",
      allowNull: false,
      unique: true
    },
    currentRound: {
      type: DataTypes.INTEGER,
      field: "current_round",
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "CREATED"
    },
    videoLink: {
      type: DataTypes.TEXT,
      field: "video_link",
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    },
    endedAt: {
      type: DataTypes.DATE,
      field: "ended_at",
      allowNull: true
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "game_sessions",
    timestamps: false
  }
);

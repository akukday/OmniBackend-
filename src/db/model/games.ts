import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

export interface GameAttributes {
  id: number;
  code: string;
  name: string;
  description?: string;
  gameType: string;
  minPlayers?: number;
  maxPlayers?: number;
  maxRounds: number;
  isActive?: boolean;
  iconUrl?: string;
  themeColor?: string;
  createdAt?: Date;
}

export type GameCreationAttributes = Optional<
  GameAttributes,
  "id" | "description" | "minPlayers" | "maxPlayers" | "isActive" | "iconUrl" | "themeColor" | "createdAt"
>;

export class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes
{
  public id!: number;
  public code!: string;
  public name!: string;
  public description?: string;
  public gameType!: string;
  public minPlayers?: number;
  public maxPlayers?: number;
  public maxRounds!: number;
  public isActive?: boolean;
  public iconUrl?: string;
  public themeColor?: string;
  public createdAt?: Date;
}

Game.init(
  {
    id: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gameType: {
      type: DataTypes.STRING(30),
      field: "game_type",
      allowNull: false
    },
    minPlayers: {
      type: DataTypes.INTEGER,
      field: "min_players",
      defaultValue: 2
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      field: "max_players",
      defaultValue: 20
    },
    maxRounds: {
      type: DataTypes.INTEGER,
      field: "max_rounds",
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: "is_active",
      defaultValue: true
    },
    iconUrl: {
      type: DataTypes.TEXT,
      field: "icon_url",
      allowNull: true
    },
    themeColor: {
      type: DataTypes.STRING(20),
      field: "theme_color",
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
    tableName: "games",
    timestamps: false
  }
);

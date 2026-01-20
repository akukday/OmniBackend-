import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";
import { Player } from "./player";

/**
 * DB attributes
 */
export interface TeamAttributes {
  id: number;
  sessionId: number;
  name: string;
  score?: number;
  createdAt?: Date;
}

/**
 * Creation attributes
 */
export type TeamCreationAttributes = Optional<
  TeamAttributes,
  "id" | "score" | "createdAt"
>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes
{
  public id!: number;
  public sessionId!: number;
  public name!: string;
  public score?: number;
  public createdAt?: Date;
}

Team.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "teams",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["session_id", "name"]
      }
    ]
  }
);

Team.hasMany(Player, { foreignKey: "teamId" });
Player.belongsTo(Team, { foreignKey: "teamId" });

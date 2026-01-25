import {
    DataTypes,
    Model,
    Optional
  } from "sequelize";
  import { dbService } from "../sequelize";
  
  export interface GameCategoryAttributes {
    id: number;
    gameId: number;
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
  }
  
  export type GameCategoryCreationAttributes =
    Optional<GameCategoryAttributes, "id" | "description" | "isActive" | "createdAt">;
  
  export class GameCategory extends Model<GameCategoryAttributes, GameCategoryCreationAttributes> implements GameCategoryAttributes {
    public id!: number;
    public gameId!: number;
    public code!: string;
    public name!: string;
    public description?: string;
    public isActive?: boolean;
    public createdAt?: Date;
  }

  GameCategory.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      gameId: {
        field: "game_id",
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      isActive: {
        field: "is_active",
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize: dbService.dbModel,
      tableName: "game_categories",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["game_id", "code"]
        }
      ]
    }
  );
  
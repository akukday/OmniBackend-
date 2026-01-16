import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface QuestionAttributes {
  id: number;
  gameId: number;
  type: string;
  questionText?: string;
  mediaUrl?: string;
  answerType?: string;
  createdAt?: Date;
}

/**
 * Creation attributes
 */
export type QuestionCreationAttributes = Optional<
  QuestionAttributes,
  "id" | "questionText" | "mediaUrl" | "answerType" | "createdAt"
>;

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes
{
  public id!: number;
  public gameId!: number;
  public type!: string;
  public questionText?: string;
  public mediaUrl?: string;
  public answerType?: string;
  public createdAt?: Date;
}

Question.init(
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
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    questionText: {
      type: DataTypes.TEXT,
      field: "question_text",
      allowNull: true
    },
    mediaUrl: {
      type: DataTypes.TEXT,
      field: "media_url",
      allowNull: true
    },
    answerType: {
      type: DataTypes.STRING(20),
      field: "answer_type",
      defaultValue: "SINGLE"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "questions",
    timestamps: false
  }
);

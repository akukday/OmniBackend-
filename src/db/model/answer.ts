import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface AnswerAttributes {
  id: number;
  sessionQuestionId: number;
  teamId: number;
  userId?: number;
  answerId?: number;
  answer?: string;
  isCorrect?: boolean;
  answeredAt?: Date;
}

/**
 * Creation attributes
 */
export type AnswerCreationAttributes = Optional<
  AnswerAttributes,
  "id" | "userId" | "answerId" | "answer" | "isCorrect" | "answeredAt"
>;

export class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes
{
  public id!: number;
  public sessionQuestionId!: number;
  public teamId!: number;
  public userId?: number;
  public answerId?: number;
  public answer?: string;
  public isCorrect?: boolean;
  public answeredAt?: Date;
}

Answer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    sessionQuestionId: {
      type: DataTypes.BIGINT,
      field: "session_question_id",
      allowNull: false
    },
    teamId: {
      type: DataTypes.BIGINT,
      field: "team_id",
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      field: "user_id",
      allowNull: true
    },
    answerId: {
      type: DataTypes.BIGINT,
      field: "answer_id",
      allowNull: true
    },
    answer: {
      type: DataTypes.TEXT,
      field: "answer",
      allowNull: true
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      field: "is_correct",
      allowNull: true
    },
    answeredAt: {
      type: DataTypes.DATE,
      field: "answered_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "answers",
    timestamps: false
  }
);

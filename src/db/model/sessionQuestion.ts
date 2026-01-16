import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface SessionQuestionAttributes {
  id: number;
  sessionId: number;
  questionId: number;
  roundNumber: number;
  startedAt?: Date;
  endedAt?: Date;
}

/**
 * Creation attributes
 */
export type SessionQuestionCreationAttributes = Optional<
  SessionQuestionAttributes,
  "id" | "startedAt" | "endedAt"
>;

export class SessionQuestion extends Model<SessionQuestionAttributes, SessionQuestionCreationAttributes> implements SessionQuestionAttributes
{
  public id!: number;
  public sessionId!: number;
  public questionId!: number;
  public roundNumber!: number;
  public startedAt?: Date;
  public endedAt?: Date;
}

SessionQuestion.init(
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
    questionId: {
      type: DataTypes.BIGINT,
      field: "question_id",
      allowNull: false
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      field: "round_number",
      allowNull: false
    },
    startedAt: {
      type: DataTypes.DATE,
      field: "started_at",
      allowNull: true
    },
    endedAt: {
      type: DataTypes.DATE,
      field: "ended_at",
      allowNull: true
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "session_questions",
    timestamps: false
  }
);

import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";
import { QuestionOption, QuestionOptionAttributes } from "./questionOption";

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
  isDeleted?: boolean;
  createdAt?: Date;
  options?: QuestionOptionAttributes[];
}

/**
 * Creation attributes
 */
export type QuestionCreationAttributes = Optional<
  QuestionAttributes,
  "id" | "questionText" | "mediaUrl" | "answerType" | "isDeleted" | "createdAt"
>;

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes
{
  public id!: number;
  public gameId!: number;
  public type!: string;
  public questionText?: string;
  public mediaUrl?: string;
  public answerType?: string;
  public isDeleted?: boolean;
  public createdAt?: Date;
  public options?: QuestionOption[];
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
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: "is_deleted",
      defaultValue: false
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

Question.hasMany(QuestionOption, {
  as: "options",
  foreignKey: "questionId"
});

QuestionOption.belongsTo(Question, {
  foreignKey: "questionId"
});

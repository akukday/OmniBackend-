import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * DB attributes
 */
export interface QuestionOptionAttributes {
  id: number;
  questionId: number;
  optionText?: string;
  optionMedia?: string;
  isCorrect: boolean;
  displayOrder?: number;
  createdAt?: Date;
}

/**
 * Creation attributes
 */
export type QuestionOptionCreationAttributes = Optional<
  QuestionOptionAttributes,
  "id" | "optionText" | "optionMedia" | "isCorrect" | "displayOrder" | "createdAt"
>;

export class QuestionOption extends Model<QuestionOptionAttributes, QuestionOptionCreationAttributes> implements QuestionOptionAttributes
{
  public id!: number;
  public questionId!: number;
  public optionText?: string;
  public optionMedia?: string;
  public isCorrect!: boolean;
  public displayOrder?: number;
  public createdAt?: Date;
}

QuestionOption.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    questionId: {
      type: DataTypes.BIGINT,
      field: "question_id",
      allowNull: false
    },
    optionText: {
      type: DataTypes.TEXT,
      field: "option_text",
      allowNull: true
    },
    optionMedia: {
      type: DataTypes.TEXT,
      field: "option_media",
      allowNull: true
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      field: "is_correct",
      defaultValue: false
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      field: "display_order",
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
    tableName: "question_options",
    timestamps: false
  }
);

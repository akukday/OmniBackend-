import { ModelStatic, Transaction } from "sequelize";
import { QuestionOption } from "../db/model/questionOption";

export class QuestionOptionRepository {
  private _repo: ModelStatic<QuestionOption>;

  constructor(private schema: string) {
    this._repo = QuestionOption.schema(schema);
  }

  static withSchema(schema: string) {
    return new QuestionOptionRepository(schema);
  }

  public async createOption(
    option: QuestionOption,
    t?: Transaction
  ): Promise<QuestionOption> {
    return this._repo.create({ ...option }, { transaction: t });
  }

  public async bulkCreateOptions(
    options: Partial<QuestionOption>[],
    t?: Transaction
  ): Promise<QuestionOption[]> {
    return this._repo.bulkCreate(options as any[], { transaction: t });
  }

  public async findByQuestion(
    questionId: number,
    t?: Transaction
  ): Promise<QuestionOption[]> {
    return this._repo.findAll({
      where: { questionId },
      order: [["displayOrder", "ASC"]],
      transaction: t
    });
  }

  public async deleteByQuestion(
    questionId: number,
    t?: Transaction
  ): Promise<number> {
    return this._repo.destroy({
      where: { questionId },
      cascade: true,
      transaction: t
    });
  }
}

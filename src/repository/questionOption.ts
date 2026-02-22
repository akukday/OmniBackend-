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
      where: { questionId, isDeleted: false },
      order: [["displayOrder", "ASC"]],
      transaction: t
    });
  }

  public async deleteByQuestion(
    questionId: number,
    t?: Transaction
  ): Promise<number> {
    const [updatedCount] = await this._repo.update({
      isDeleted: true
    }, {
      where: { questionId, isDeleted: false },
      transaction: t
    });
    return updatedCount;
  }

  public async syncOptions(questionId: number, options: any[]) {
    await QuestionOption.schema(this.schema).update({
      isDeleted: true
    }, {
      where: { questionId, isDeleted: false }
    });

    if (!options || options.length === 0) {
      return;
    }

    await QuestionOption.schema(this.schema).bulkCreate(
      options.map((opt: any, index: number) => ({
        questionId,
        optionText: opt.optionText,
        optionMedia: opt.optionMedia,
        isCorrect: !!opt.isCorrect,
        displayOrder: opt.displayOrder ?? index + 1,
        isDeleted: false
      }))
    );
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<QuestionOption | null> {
    return this._repo.findOne({
      where: { id, isDeleted: false },
      transaction: t
    });
  }
}

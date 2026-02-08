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

  public async syncOptions(questionId: number, options: any[]) {
    const existing = await QuestionOption.schema(this.schema)
      .findAll({ where: { questionId } });
    const existingMap = new Map(existing.map(o => [o.dataValues.id, o]));
    const incomingIds = new Set<number>();

    for (const opt of options) {
      if (opt.id) {        // UPDATE
        const existingOpt = existingMap.get(opt.id);
        if (existingOpt) {
          await existingOpt.update({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            displayOrder: opt.displayOrder
          });
          incomingIds.add(opt.id);
        }
      } else {        // CREATE
        await QuestionOption.schema(this.schema)
          .create({
            questionId,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            displayOrder: opt.displayOrder
          });
      }
    }

    const toDelete = existing.filter(o => !incomingIds.has(o.id)).map(o => o.id);     // DELETE removed options
    if (toDelete.length) {
      await QuestionOption.schema(this.schema)
        .destroy({where: { id: toDelete }});
    }
  }

  public async findById(
    id: number,
    t?: Transaction
  ): Promise<QuestionOption | null> {
    return this._repo.findOne({
      where: { id },
      transaction: t
    });
  }
}

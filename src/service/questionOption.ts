import { QuestionOptionAttributes } from "../db/model/questionOption";
import { QuestionOptionRepository } from "../repository/questionOption";

export interface QuestionOptionResponse {
  id: number;
  questionId: number;
  optionText?: string;
  optionMedia?: string;
  displayOrder?: number;
}

export class QuestionOptionService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new QuestionOptionService(schema);
  }

  private transform(result: any): QuestionOptionResponse {
    result = result?.dataValues as QuestionOptionAttributes;
    return {
      id: result.id,
      questionId: result.questionId,
      optionText: result.optionText,
      optionMedia: result.optionMedia,
      displayOrder: result.displayOrder
    };
  }

  public async createOption(payload: {
    questionId: number;
    optionText?: string;
    optionMedia?: string;
    isCorrect?: boolean;
    displayOrder?: number;
  }): Promise<QuestionOptionResponse> {
    const option = await QuestionOptionRepository
      .withSchema(this.schema)
      .createOption(payload as any);

    return this.transform(option);
  }

  public async bulkCreateOptions(
    questionId: number,
    options: {
      optionText?: string;
      optionMedia?: string;
      isCorrect?: boolean;
      displayOrder?: number;
    }[]
  ): Promise<QuestionOptionResponse[]> {
    const created = await QuestionOptionRepository
      .withSchema(this.schema)
      .bulkCreateOptions(
        options.map(o => ({
          ...o,
          questionId
        })) as any[]
      );

    return created.map(o => this.transform(o));
  }

  public async getOptionsByQuestion(
    questionId: number
  ): Promise<QuestionOptionResponse[]> {
    const options = await QuestionOptionRepository
      .withSchema(this.schema)
      .findByQuestion(questionId);

    return options.map(o => this.transform(o));
  }

  public async deleteOptionsByQuestion(questionId: number): Promise<void> {
    await QuestionOptionRepository
      .withSchema(this.schema)
      .deleteByQuestion(questionId);
  }
}

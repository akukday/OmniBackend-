import { QuestionAttributes } from "../db/model/question";
import { QuestionRepository } from "../repository/question";

interface QuestionOptionResponse {
  id: number;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface QuestionResponse {
  id: number;
  gameId: number;
  type: string;
  questionText?: string;
  mediaUrl?: string;
  answerType: string;
  options?: QuestionOptionResponse[];
}

export class QuestionService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new QuestionService(schema);
  }

  private transform(result: any): QuestionResponse {
    result = result?.dataValues as QuestionAttributes;
    return {
      id: result.id,
      gameId: result.gameId,
      type: result.type,
      questionText: result.questionText,
      mediaUrl: result.mediaUrl,
      answerType: result.answerType ?? "SINGLE",
      options: (result?.options as any)?.map((opt: any) => {
        const o = opt.dataValues;
        return {
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          displayOrder: o.displayOrder
        };
      }) ?? []
    };
  }

  public async createQuestion(payload: {
    gameId: number;
    type: string;
    questionText?: string;
    mediaUrl?: string;
    answerType?: string;
  }): Promise<QuestionResponse> {
    const question = await QuestionRepository
      .withSchema(this.schema)
      .createQuestion(payload as any);

    return this.transform(question);
  }

  public async getQuestionsByGame(
    gameId: number
  ): Promise<QuestionResponse[]> {
    const questions = await QuestionRepository
      .withSchema(this.schema)
      .findByGame(gameId);

    return questions.map(q => this.transform(q));
  }

  public async deleteQuestion(questionId: number): Promise<void> {
    await QuestionRepository
      .withSchema(this.schema)
      .deleteQuestion(questionId);
  }
}

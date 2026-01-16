import { QuestionAttributes } from "../db/model/question";
import { QuestionRepository } from "../repository/question";

export interface QuestionResponse {
  id: number;
  gameId: number;
  type: string;
  questionText?: string;
  mediaUrl?: string;
  answerType: string;
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
      answerType: result.answerType ?? "SINGLE"
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

import { QuestionOptionRepository } from "../repository/questionOption";
import { Question, QuestionAttributes } from "../db/model/question";
import { QuestionRepository } from "../repository/question";

interface QuestionOptionResponse {
  id: number;
  optionText?: string;
  optionMedia?: string;
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
          optionMedia: o.optionMedia,
          isCorrect: o.isCorrect,
          displayOrder: o.displayOrder
        };
      }) ?? []
    };
  }

  public async createQuestion(payload: {
    gameId: number;
    type?: string;
    questionText?: string;
    mediaUrl?: string;
    answerType?: string;
    options?: {
      optionText?: string;
      optionMedia?: string;
      isCorrect?: boolean;
      displayOrder?: number;
    }[];
  }): Promise<QuestionResponse> {
    const question = await QuestionRepository
      .withSchema(this.schema)
      .createQuestion({
        gameId: payload.gameId,
        type: payload.type ?? "MCQ",
        questionText: payload.questionText,
        mediaUrl: payload.mediaUrl,
        answerType: payload.answerType ?? "SINGLE"
      } as any);

    if (payload.options && payload.options.length > 0) {
      await QuestionOptionRepository.withSchema(this.schema)
        .syncOptions(question.dataValues.id, payload.options);
    }

    const savedQuestion = await QuestionRepository
      .withSchema(this.schema)
      .findById(question.dataValues.id);

    return this.transform(savedQuestion);
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
    await QuestionOptionRepository
      .withSchema(this.schema)
      .deleteByQuestion(questionId);

    await QuestionRepository
      .withSchema(this.schema)
      .deleteQuestion(questionId);
  }

  public async updateQuestion(questionId: number, payload: any): Promise<QuestionResponse> {
    const question = await Question.schema(this.schema!).findOne({
      where: { id: questionId, isDeleted: false }
    });

    if (!question) {
      throw new Error("Question not found");
    }

    await question.update(payload);

    if (payload.options) {
      await QuestionOptionRepository.withSchema(this.schema)
        .syncOptions(questionId, payload.options);
    }

    const updatedQuestion = await QuestionRepository.withSchema(this.schema!).findById(questionId);
    return this.transform(updatedQuestion);
  }
}

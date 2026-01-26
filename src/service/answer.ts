import { AnswerAttributes, AnswerCreationAttributes } from "../db/model/answer";
import { AnswerRepository } from "../repository/answer";
import { SessionQuestionRepository } from "../repository/sessionQuestion";
import { QuestionOptionRepository } from "../repository/questionOption";

export interface AnswerResponse {
  id: number;
  sessionQuestionId: number;
  teamId: number;
  answerId?: number;
  answer?: string;
  isCorrect?: boolean;
  answeredAt?: Date;
}

export class AnswerService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new AnswerService(schema);
  }

  private transform(result: any): AnswerResponse {
    result = result?.dataValues as AnswerAttributes;
    return {
      id: result.id,
      sessionQuestionId: result.sessionQuestionId,
      teamId: result.teamId,
      answerId: result.answerId,
      answer: result.answer,
      isCorrect: result.isCorrect,
      answeredAt: result.answeredAt
    };
  }

  public async submitAnswer(payload: {
    sessionQuestionId: number;
    teamId: number;
    answerId?: number;
    answer?: string;
  }, userId: string): Promise<AnswerResponse> {
    // Verify session question exists
    const sessionQuestion = await SessionQuestionRepository
      .withSchema(this.schema)
      .findById(payload.sessionQuestionId);

    if (!sessionQuestion) {
      throw new Error("Session question not found");
    }

    let isCorrect: boolean | undefined = undefined;

    // If answerId is provided, check if the option is correct
    if (payload.answerId) {
      const questionOption = await QuestionOptionRepository
        .withSchema(this.schema)
        .findById(payload.answerId);
      
      if (questionOption) {
        isCorrect = questionOption.dataValues.isCorrect;
      }
    }
    // Prepare answer payload with all relevant parameters
    const answerPayload: AnswerCreationAttributes = {
      sessionQuestionId: payload.sessionQuestionId,
      teamId: payload.teamId,
      userId: userId,
      answerId: payload.answerId,
      answer: payload.answer,
      isCorrect: isCorrect,
      answeredAt: new Date()
    };

    const created = await AnswerRepository
      .withSchema(this.schema)
      .submitAnswer(answerPayload as any);

    return this.transform(created);
  }

  public async getAnswersForQuestion(
    sessionQuestionId: number
  ): Promise<AnswerResponse[]> {
    const answers = await AnswerRepository
      .withSchema(this.schema)
      .findBySessionQuestion(sessionQuestionId);

    return answers.map(a => this.transform(a));
  }

  /**
   * Host-only evaluation (no auto sockets)
   */
  public async evaluateAnswer(
    answerId: number,
    isCorrect: boolean
  ): Promise<void> {
    await AnswerRepository
      .withSchema(this.schema)
      .markCorrectness(answerId, isCorrect);
  }
}

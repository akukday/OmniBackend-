import { AnswerAttributes } from "../db/model/answer";
import { AnswerRepository } from "../repository/answer";

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
    userId?: number;
    answerId?: number;
    answer?: string;
  }): Promise<AnswerResponse> {
    // Prevent duplicate answers per team per question
    const existing = await AnswerRepository
      .withSchema(this.schema)
      .findTeamAnswer(payload.sessionQuestionId, payload.teamId);

    if (existing) {
      throw new Error("Answer already submitted for this round");
    }

    const created = await AnswerRepository
      .withSchema(this.schema)
      .submitAnswer(payload as any);

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

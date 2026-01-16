import { SessionQuestionAttributes } from "../db/model/sessionQuestion";
import { SessionQuestionRepository } from "../repository/sessionQuestion";

export interface SessionQuestionResponse {
  id: number;
  sessionId: number;
  questionId: number;
  roundNumber: number;
  startedAt?: Date;
  endedAt?: Date;
}

export class SessionQuestionService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new SessionQuestionService(schema);
  }

  private transform(result: any): SessionQuestionResponse {
    result = result?.dataValues as SessionQuestionAttributes;
    return {
      id: result.id,
      sessionId: result.sessionId,
      questionId: result.questionId,
      roundNumber: result.roundNumber,
      startedAt: result.startedAt,
      endedAt: result.endedAt
    };
  }

  public async addQuestionToSession(payload: {
    sessionId: number;
    questionId: number;
    roundNumber: number;
  }): Promise<SessionQuestionResponse> {
    const created = await SessionQuestionRepository
      .withSchema(this.schema)
      .create(payload as any);

    return this.transform(created);
  }

  public async getSessionQuestions(
    sessionId: number
  ): Promise<SessionQuestionResponse[]> {
    const questions = await SessionQuestionRepository
      .withSchema(this.schema)
      .findBySession(sessionId);

    return questions.map(q => this.transform(q));
  }

  public async startRound(
    sessionId: number,
    roundNumber: number
  ): Promise<void> {
    const sq = await SessionQuestionRepository
      .withSchema(this.schema)
      .findBySessionAndRound(sessionId, roundNumber);

    if (!sq) {
      throw new Error("Round not found");
    }

    await SessionQuestionRepository
      .withSchema(this.schema)
      .markStarted(sq.id);
  }

  public async endRound(
    sessionId: number,
    roundNumber: number
  ): Promise<void> {
    const sq = await SessionQuestionRepository
      .withSchema(this.schema)
      .findBySessionAndRound(sessionId, roundNumber);

    if (!sq) {
      throw new Error("Round not found");
    }

    await SessionQuestionRepository
      .withSchema(this.schema)
      .markEnded(sq.id);
  }
}

import { SessionQuestionAttributes } from "../db/model/sessionQuestion";
import { SessionQuestionRepository } from "../repository/sessionQuestion";
import { QuestionResponse } from "./question";
import { QuestionOptionResponse } from "./questionOption";
import { QuestionOptionService } from "./questionOption";
import { QuestionRepository } from "../repository/question";
import { Transaction } from "sequelize";

export interface SessionQuestionResponse {
  id: number;
  sessionId: number;
  questionId: number;
  roundNumber: number;
  startedAt?: Date;
  endedAt?: Date;
  question?: QuestionResponse;
  options?: QuestionOptionResponse[];
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

  public async startRound(sessionId: number, roundNumber: number, t?: Transaction): Promise<SessionQuestionResponse> {
    const sq = await SessionQuestionRepository.withSchema(this.schema)
      .findBySessionAndRound(sessionId, roundNumber, t);

    if (!sq) {
      throw new Error("Round not found");
    }

    const updated = await SessionQuestionRepository.withSchema(this.schema)
      .startRound(sessionId, roundNumber, t);

    if (!updated) {
      throw new Error("Failed to start round");
    }

    const response = this.transform(updated);

    // Fetch question details
    const questionData = await QuestionRepository.withSchema(this.schema)
      .findById(response.questionId, t);

    if (questionData) {
      const questionResponse: QuestionResponse = {
        id: questionData.dataValues.id,
        gameId: questionData.dataValues.gameId,
        type: questionData.dataValues.type,
        questionText: questionData.dataValues.questionText,
        mediaUrl: questionData.dataValues.mediaUrl,
        answerType: questionData.dataValues.answerType ?? "SINGLE"
      };
      response.question = questionResponse;

      // Fetch options
      const options = await QuestionOptionService.withSchema(this.schema)
        .getOptionsByQuestion(updated.dataValues.questionId, t);
      response.options = options;
    }

    return response;
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
      .endRound(sq.id, roundNumber);
  }
}

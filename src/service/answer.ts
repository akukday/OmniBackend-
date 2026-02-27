import { AnswerAttributes, AnswerCreationAttributes } from "../db/model/answer";
import { AnswerRepository } from "../repository/answer";
import { SessionQuestionRepository } from "../repository/sessionQuestion";
import { QuestionOptionRepository } from "../repository/questionOption";
import { TeamRepository } from "../repository/team";
import { dbService } from "../db/sequelize";

export interface AnswerResponse {
  id: number;
  sessionQuestionId: number;
  teamId: number;
  answerId?: number;
  answer?: string;
  isCorrect?: boolean;
  answeredAt?: Date;
}

export interface FirstAnswerResponse {
  answered: boolean;
  teamId?: number;
  teamName?: string;
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
    const t = await dbService.dbModel.transaction();
    try {
    // Verify session question exists
    const sessionQuestion = await SessionQuestionRepository
      .withSchema(this.schema)
      .findById(payload.sessionQuestionId, t);

    if (!sessionQuestion) {
      throw new Error("Session question not found");
    }

    const team = await TeamRepository
      .withSchema(this.schema)
      .findById(payload.teamId, t);
    if (!team) {
      throw new Error("Team not found");
    }

    if (Number(team.dataValues.sessionId) !== Number(sessionQuestion.dataValues.sessionId)) {
      throw new Error("Team does not belong to this session");
    }

    // Prevent multiple submissions by the same team for the same question.
    const existingAnswer = await AnswerRepository
      .withSchema(this.schema)
      .findTeamAnswer(payload.sessionQuestionId, payload.teamId, t);
    if (existingAnswer) {
      await t.commit();
      return this.transform(existingAnswer);
    }

    let isCorrect: boolean | undefined = undefined;

    // If answerId is provided, check if the option is correct
    if (payload.answerId) {
      const questionOption = await QuestionOptionRepository
        .withSchema(this.schema)
        .findById(payload.answerId, t);
      
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
      .submitAnswer(answerPayload as any, t);

    if (isCorrect) {
      await TeamRepository
        .withSchema(this.schema)
        .incrementScore(payload.teamId, 1, t);
    }

    await t.commit();

    return this.transform(created);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  public async getAnswersForQuestion(
    sessionQuestionId: number
  ): Promise<AnswerResponse[]> {
    const answers = await AnswerRepository
      .withSchema(this.schema)
      .findBySessionQuestion(sessionQuestionId);

    return answers.map(a => this.transform(a));
  }

  public async getFirstCorrectAnswer(sessionId: number, questionId: number): Promise<FirstAnswerResponse> {
    const rows: any[] = await AnswerRepository.withSchema(this.schema)
      .findFirstAnswer(sessionId, questionId);

    if (!rows || rows.length === 0) {
      return { answered: false };
    }

    const first = rows[0];
    return {
      answered: true,
      teamId: first.team_id,
      teamName: first.team_name,
      answeredAt: first.answered_at
    };
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

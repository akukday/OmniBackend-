import { dbService } from "../db/sequelize";
import { GameSessionAttributes } from "../db/model/gameSession";
import { GameSessionRepository } from "../repository/gameSession";
import { randomBytes } from "crypto";
import { SessionQuestionRepository } from "../repository/sessionQuestion";
import { GameRepository } from "../repository/games";
import { GameCategoryRepository } from "../repository/gameCategory";
import { QuestionRepository } from "../repository/question";
import { SessionQuestionResponse, SessionQuestionService } from "./sessionQuestion";

export interface GameSessionResponse {
  id: number;
  gameId: number;
  hostUserId: string;
  joinCode: string;
  status: string;
  currentRound: number;
  videoLink?: string;
}

export class GameSessionService {
  constructor(private schema: string) {}

  static withSchema(schema: string) {
    return new GameSessionService(schema);
  }

  private generateJoinCode(): string {
    return randomBytes(4).toString("hex").toUpperCase(); // 8 chars
  }

  private transform(result: any): GameSessionResponse {
    result = result?.dataValues as GameSessionAttributes;
    return {
      id: result.id,
      gameId: result.gameId,
      hostUserId: result.hostUserId,
      joinCode: result.joinCode,
      status: result.status,
      currentRound: result.currentRound ?? 0,
      videoLink: result.videoLink
    };
  }

  public async createSession(
    gameId: number,
    hostUserId: string
  ): Promise<GameSessionResponse> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .createSession({
        gameId,
        hostUserId,
        categories: [],
        currentRound: 0,
        joinCode: this.generateJoinCode(),
        status: "CREATED"
      } as any);

    return this.transform(session);
  }

  public async startGameSession(sessionId: number, userId: string, categoryIds: number[]): Promise<SessionQuestionResponse> {
    const transaction = await dbService.dbModel.transaction();
    try {
      const session = await GameSessionRepository.withSchema(this.schema)
        .findById(sessionId, transaction);
      
      if (session?.dataValues.hostUserId !== userId) {
        throw new Error("You are not the host for this game!");
      }

      if (!session || !['CREATED', 'LOBBY'].includes(session.dataValues.status)) {
        throw new Error("Game cannot be started");
      }

      const gameId = session.dataValues.gameId;

      // Validate and persist categories if provided. Verify all categories belong to this game
      if (categoryIds && categoryIds.length > 0) {
        const gameCategories = await GameCategoryRepository
          .withSchema(this.schema)
          .findByGame(gameId, true, transaction);

        const validCategoryIds = gameCategories.map(cat => cat?.dataValues.id).map(Number);
        const invalidCategoryIds = categoryIds.filter(id => !validCategoryIds.includes(id));
        if (invalidCategoryIds.length > 0) {
          throw new Error(`Invalid category IDs: ${invalidCategoryIds.join(', ')}`);
        }
      }

      await GameSessionRepository.withSchema(this.schema)
        .startSession(sessionId, categoryIds, transaction);

      const game = await GameRepository.withSchema(this.schema)
        .findById(gameId, transaction);

      if (!game) {
        throw new Error("Game not found");
      }

      const maxRounds = game.dataValues.maxRounds;
      const allQuestions: any[] = categoryIds && categoryIds.length > 0
        ? await QuestionRepository.withSchema(this.schema).findByGameAndCategories(gameId, categoryIds, transaction)
        : await QuestionRepository.withSchema(this.schema).findByGame(gameId, transaction);
      
      if (allQuestions.length === 0) {
        throw new Error("No questions available for this game" + 
          (categoryIds && categoryIds.length > 0 ? " with the selected categories" : ""));
      }

      // Randomly select one question per round
      const availableQuestions = [...allQuestions];
      for (let round = 1; round <= maxRounds; round++) {
        if (availableQuestions.length === 0) {
          availableQuestions.push(...allQuestions); // If we run out of questions, reuse them
        }
        // Randomly select a question
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions.splice(randomIndex, 1)[0];

        // Create SessionQuestion entry for this round
        await SessionQuestionRepository.withSchema(this.schema)
          .create({sessionId, questionId: selectedQuestion.dataValues.id, roundNumber: round} as any, transaction);
      }

      // Start round 1
      const response = await SessionQuestionService.withSchema(this.schema)
        .startRound(sessionId, 1, transaction);

      await transaction.commit();

      return response;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async joinByCode(joinCode: string): Promise<GameSessionResponse> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .findByJoinCode(joinCode);

    if (!session) {
      throw new Error("Invalid join code");
    }

    return this.transform(session);
  }

  public async getGameSession(sessionId: number): Promise<GameSessionResponse> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .findById(sessionId);
    
    return this.transform(session);
  }

  public async endSession(sessionId: number): Promise<void> {
    const session = await GameSessionRepository
      .withSchema(this.schema)
      .findById(sessionId);

    await SessionQuestionRepository
      .withSchema(this.schema)
      .endRound(sessionId, session?.currentRound ?? 0);
      
    await GameSessionRepository
      .withSchema(this.schema)
      .endSession(sessionId);
  }

  public async startNextRound(sessionId: number, userId: string): Promise<SessionQuestionResponse | { message: string }> {
    const sequelize = dbService.dbModel;
    const t = await sequelize.transaction();

    const session = await GameSessionRepository.withSchema(this.schema)
      .findById(sessionId, t);
    if (session?.dataValues.hostUserId !== userId) {
      throw new Error("You are not the host for this game!");
    }

    try {
      if (!session) {
        throw new Error("Cannot start next round");
      }
      const game = await GameRepository.withSchema(this.schema).findById(session.dataValues.gameId, t);
      const currentRound = session.dataValues.currentRound;
      const maxRounds = game?.dataValues.maxRounds;

      if ((currentRound ?? 0) >= (maxRounds ?? 1)) {
        await GameSessionRepository
          .withSchema(this.schema)
          .completeSession(sessionId, t);

        await SessionQuestionRepository.withSchema(this.schema)
          .endRound(sessionId, currentRound ?? 0, t); // Update the endedAt for preious round

        await t.commit();
        return { message: "Game completed" };
      }

      const nextRound = (currentRound ?? 0) + 1;
      await GameSessionRepository.withSchema(this.schema)
        .activateRound(sessionId, nextRound, t);

      const response = await SessionQuestionService.withSchema(this.schema)
        .startRound(sessionId, nextRound, t);

      await t.commit();
      return response;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

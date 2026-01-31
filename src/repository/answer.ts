import { ModelStatic, QueryTypes, Transaction } from "sequelize";
import { Answer } from "../db/model/answer";

export class AnswerRepository {
  private _repo: ModelStatic<Answer>;

  constructor(private schema: string) {
    this._repo = Answer.schema(schema);
  }

  static withSchema(schema: string) {
    return new AnswerRepository(schema);
  }

  public async submitAnswer(
    payload: Answer,
    t?: Transaction
  ): Promise<Answer> {
    return this._repo.create({ ...payload }, { transaction: t });
  }

  public async findBySessionQuestion(
    sessionQuestionId: number,
    t?: Transaction
  ): Promise<Answer[]> {
    return this._repo.findAll({
      where: { sessionQuestionId },
      transaction: t
    });
  }

  public async findTeamAnswer(
    sessionQuestionId: number,
    teamId: number,
    t?: Transaction
  ): Promise<Answer | null> {
    return this._repo.findOne({
      where: { sessionQuestionId, teamId },
      transaction: t
    });
  }

  public async markCorrectness(
    id: number,
    isCorrect: boolean,
    t?: Transaction
  ): Promise<void> {
    await this._repo.update(
      { isCorrect },
      { where: { id }, transaction: t }
    );
  }

  public async findFirstAnswer(sessionId: number, questionId: number) {
    return this._repo.sequelize!.query(
      `
      SELECT 
        a.id,
        a.answered_at,
        t.id   AS team_id,
        t.name AS team_name
      FROM ${this.schema}.answers a
      JOIN ${this.schema}.session_questions sq ON sq.id = a.session_question_id
      JOIN ${this.schema}.teams t ON t.id = a.team_id
      WHERE sq.session_id = :sessionId
        AND sq.question_id = :questionId
        AND a.is_correct = true
      ORDER BY a.answered_at ASC
      LIMIT 1
      `,
      {
        replacements: { sessionId, questionId },
        type: QueryTypes.SELECT
      }
    );
  }
}

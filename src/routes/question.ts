import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { QuestionService } from "../service/question";
import { SessionHelper } from "../common/middleware/sessionHelper";
import { SessionQuestionService } from "../service/sessionQuestion";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

/**
 * Create question (Admin / Host)
 */
router.post("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { gameId, type, questionText, mediaUrl, answerType } = req.body;

    const question = await QuestionService
      .withSchema(req.schema!)
      .createQuestion({
        gameId,
        type,
        questionText,
        mediaUrl,
        answerType
      });

    res.status(201).send(question);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get questions by game
 */
router.get("/game/:gameId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const questions = await QuestionService
      .withSchema(req.schema!)
      .getQuestionsByGame(Number(req.params.gameId));

    res.status(200).send(questions);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Delete question
 */
router.delete("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    await QuestionService
      .withSchema(req.schema!)
      .deleteQuestion(Number(req.params.id));

    res.status(200).send({ message: "Question deleted" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Add question to session (assign round)
 */
router.post("/session", async (req: Request, res: Response) => {
  try {
    const result = await SessionQuestionService
      .withSchema(req.schema!)
      .addQuestionToSession(req.body);

    res.status(201).send(result);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get all session questions
 */
router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const result = await SessionQuestionService
      .withSchema(req.schema!)
      .getSessionQuestions(Number(req.params.sessionId));

    res.status(200).send(result);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Start round
 */
router.post("/session/:sessionId/round/:round/start", async (req, res) => {
  try {
    const result = await SessionQuestionService
      .withSchema(req.schema!)
      .startRound(
        Number(req.params.sessionId),
        Number(req.params.round)
      );

    res.status(200).send(result);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * End round
 */
router.post("/session/:sessionId/round/:round/end", async (req, res) => {
  try {
    await SessionQuestionService
      .withSchema(req.schema!)
      .endRound(
        Number(req.params.sessionId),
        Number(req.params.round)
      );

    res.status(200).send({ message: "Round ended" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

export default router;

import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { QuestionService } from "../service/question";
import { SessionHelper } from "../common/middleware/sessionHelper";
import { SessionQuestionService } from "../service/sessionQuestion";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

router.post("/media/upload-url", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { gameId, contentType, fileName, scope } = req.body;
    const parsedGameId = Number(gameId);
    if (!Number.isFinite(parsedGameId)) {
      return res.status(400).send({ ERRMSG: "Invalid gameId" });
    }

    const allowedContentTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedContentTypes.includes(contentType)) {
      return res.status(400).send({ ERRMSG: "Unsupported contentType" });
    }

    if (scope && !["question", "option"].includes(scope)) {
      return res.status(400).send({ ERRMSG: "Invalid scope" });
    }

    const signedUrl = await QuestionService
      .withSchema(req.schema!)
      .getMediaUploadUrl({
        gameId: parsedGameId,
        contentType,
        fileName,
        scope
      });

    res.status(200).send(signedUrl);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Create question (Admin / Host)
 */
router.post("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { gameId, type, questionText, mediaUrl, answerType, options } = req.body;

    const parsedGameId = Number(gameId);
    if (!Number.isFinite(parsedGameId)) {
      throw new Error("Invalid gameId");
    }

    const question = await QuestionService
      .withSchema(req.schema!)
      .createQuestion({
        gameId: parsedGameId,
        type,
        questionText,
        mediaUrl,
        answerType,
        options
      });

    res.status(201).send(question);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Update question (Admin / Host)
 */
router.put("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const updatedQuestion = await QuestionService.withSchema(req.schema!)
      .updateQuestion(Number(req.params.id),
        {
          type: req.body.type,
          questionText: req.body.questionText,
          mediaUrl: req.body.mediaUrl,
          answerType: req.body.answerType,
          options: req.body.options
        }
      );

    res.status(200).send(updatedQuestion);
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

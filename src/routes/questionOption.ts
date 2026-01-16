import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { QuestionOptionService } from "../service/questionOption";
import { AnswerService } from "../service/answer";
import { SessionHelper } from "../common/middleware/sessionHelper";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

/**
 * Create single option
 */
router.post("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const option = await QuestionOptionService
      .withSchema(req.schema!)
      .createOption(req.body);

    res.status(201).send(option);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Bulk create options for a question
 */
router.post("/bulk/:questionId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const options = await QuestionOptionService
      .withSchema(req.schema!)
      .bulkCreateOptions(
        Number(req.params.questionId),
        req.body.options
      );

    res.status(201).send(options);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get options by question
 */
router.get("/question/:questionId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const options = await QuestionOptionService
      .withSchema(req.schema!)
      .getOptionsByQuestion(Number(req.params.questionId));

    res.status(200).send(options);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Submit answer (player / team)
 */
router.post("/answer", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const result = await AnswerService
      .withSchema(req.schema!)
      .submitAnswer(req.body);

    res.status(201).send(result);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get all answers for a session question (host)
 */
router.get("/session-question/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const result = await AnswerService
      .withSchema(req.schema!)
      .getAnswersForQuestion(Number(req.params.id));

    res.status(200).send(result);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Evaluate answer (host)
 */
router.post("/:answerId/evaluate", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    await AnswerService
      .withSchema(req.schema!)
      .evaluateAnswer(
        Number(req.params.answerId),
        Boolean(req.body.isCorrect)
      );

    res.status(200).send({ message: "Answer evaluated" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

export default router;

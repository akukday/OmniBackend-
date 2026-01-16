import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { TeamService } from "../service/team";
import { SessionHelper } from "../common/middleware/sessionHelper";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

/**
 * Create team (HOST)
 */
router.post("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { sessionId, name } = req.body;

    const team = await TeamService
      .withSchema(req.schema!)
      .createTeam(sessionId, name);

    res.status(201).send(team);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get teams for a session
 */
router.get("/session/:sessionId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const teams = await TeamService
      .withSchema(req.schema!)
      .getTeamsBySession(Number(req.params.sessionId));

    res.status(200).send(teams);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Update team score
 */
router.put("/:id/score", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { score } = req.body;

    await TeamService
      .withSchema(req.schema!)
      .updateScore(Number(req.params.id), score);

    res.status(200).send({ message: "Score updated" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Delete team
 */
router.delete("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    await TeamService
      .withSchema(req.schema!)
      .deleteTeam(Number(req.params.id));

    res.status(200).send({ message: "Team deleted" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

export default router;

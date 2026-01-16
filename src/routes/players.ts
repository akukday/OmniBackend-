import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { InviteService } from "../service/invite";
import { PlayerService } from "../service/player";
import { SessionHelper } from "../common/middleware/sessionHelper";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

/**
 * Create invite (HOST)
 */
router.post("/invite", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { sessionId, email, mobile, invitedName, expiresAt } = req.body;

    const invite = await InviteService
      .withSchema(req.schema!)
      .createInvite(sessionId, {
        email,
        mobile,
        invitedName,
        expiresAt
      });

    res.status(201).send(invite);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get invites for a session
 */
router.get("/invite/session/:sessionId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const invites = await InviteService
      .withSchema(req.schema!)
      .getInvitesBySession(Number(req.params.sessionId));

    res.status(200).send(invites);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Mark invite as used
 */
router.post("/invite/:id/use", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    await InviteService
      .withSchema(req.schema!)
      .markInviteUsed(Number(req.params.id));

    res.status(200).send({ message: "Invite marked as used" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Join game session (guest or logged-in user)
 */
router.post("/join", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { sessionId, name, teamId, userId } = req.body;

    const player = await PlayerService
      .withSchema(req.schema!)
      .joinSession({ sessionId, name, teamId, userId });

    res.status(201).send(player);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Get players by session
 */
router.get("/session/:sessionId", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const players = await PlayerService
      .withSchema(req.schema!)
      .getPlayersBySession(Number(req.params.sessionId));

    res.status(200).send(players);
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Assign / change team for player
 */
router.put("/:id/team", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;

    await PlayerService
      .withSchema(req.schema!)
      .assignTeam(Number(req.params.id), teamId);

    res.status(200).send({ message: "Player team updated" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

/**
 * Remove player from session
 */
router.delete("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    await PlayerService
      .withSchema(req.schema!)
      .removePlayer(Number(req.params.id));

    res.status(200).send({ message: "Player removed" });
  } catch (error) {
    ErrorUtil.handleError(error, req, res);
  }
});

export default router;

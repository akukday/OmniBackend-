import { Router, Request, Response } from "express";
import { schemaResolver } from "../db/schemaResolver";
import { ErrorUtil } from "../util/errorUtil";
import { InviteService } from "../service/invite";
import { PlayerService } from "../service/player";
import { SessionHelper } from "../common/middleware/sessionHelper";
import { check, validationResult } from "express-validator";
import { GameSessionService } from "../service/gameSession";
import { AccountService } from "../service/account";
import { TeamService } from "../service/team";

const router = Router({ strict: true, caseSensitive: false });

router.use(schemaResolver);

/**
 * Create invite (HOST)
 */
router.post("/invites", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
  try {
    const { sessionId, invites } = req.body;

    const invite = await InviteService
      .withSchema(req.schema!)
      .createInvite(sessionId, invites);

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
 * Join game session 
 */
router.post("/join", SessionHelper.isUserLoggedIn(), [check('joinCode').notEmpty().withMessage('Join code can not be empty')],
  async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
    }
    const { joinCode } = req.body;
    const userId = SessionHelper.getCurrentUserId(req);
    const user = await AccountService.withSchema(req.schema!).getAccountByUserId(userId);
    const session = await GameSessionService.withSchema(req.schema!).joinByCode(joinCode);
    if (!session) {
      return res.status(404).json({ message: "Invalid join code" });
    }

    if (!['CREATED', 'LOBBY'].includes(session.status)) {
      return res.status(400).json({ message: "Game already started" });
    }

    // Find if anyone got the explicit invitation
    const invited = (await InviteService.withSchema(req.schema!).getInvitesBySession(session.id))
        .filter(i =>(user?.email && i.email === user.email) || (user?.phoneNo && i.mobile === user.phoneNo))

    // Random team assignment
    const team = await TeamService.withSchema(req.schema!).findTeamWithLeastPlayers(session.id);
    if (!team) {
      return res.status(400).json({message: "No teams available"});
    }

    const player = await PlayerService
      .withSchema(req.schema!)
      .joinSession({ sessionId: session.id, name: user?.fullName || "", teamId: team.id, userId: userId });

    // Mark all explicit invites as USED
    if(invited.length !== 0) {
      await InviteService.withSchema(req.schema!).markInviteUsed(invited.map(x => x.id));
    }

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

import { Router, Request, Response, NextFunction } from "express";
import { ErrorUtil } from "../util/errorUtil";
import { schemaResolver } from "../db/schemaResolver";
import { GameService } from "../service/games";
import { SessionHelper } from "../common/middleware/sessionHelper";
import { GameSessionService } from "../service/gameSession";

const router = Router({
  strict: true,
  caseSensitive: false
});

/**
 * Resolve tenant schema
 */
router.use(schemaResolver);

router.get("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!;
      const games = await GameService
        .withSchema(schema)
        .getAllActiveGames();

      res.status(200).send(games);
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  }
);

router.get("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!;
      const gameId = Number(req.params.id);

      if (isNaN(gameId)) {
        return res.status(400).send({ ERRMSG: "Invalid game id" });
      }

      const game = await GameService
        .withSchema(schema)
        .getGameById(gameId);

      if (!game) {
        return res.status(404).send({ ERRMSG: "Game not found" });
      }

      res.status(200).send(game);
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  }
);

router.post("/", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema;

      const game = await GameService
        .withSchema(schema!)
        .createGame(req.body);

      res.status(201).send(game);
    } catch (error: any) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res.status(409).send({ ERRMSG: "Game code already exists" });
      }
      ErrorUtil.handleError(error, req, res);
    }
  }
);

router.delete("/:id", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!;
      const gameId = Number(req.params.id);

      if (isNaN(gameId)) {
        return res.status(400).send({ ERRMSG: "Invalid game id" });
      }

      await GameService
        .withSchema(schema)
        .deactivateGame(gameId);

      res.status(200).send({ message: "Game deactivated successfully" });
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  }
);

router.post("/game-session", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
    try {
      const { gameId } = req.body;
  
      const session = await GameSessionService
        .withSchema(req.schema!)
        .createSession(gameId, SessionHelper.getCurrentUserId(req));
  
      res.status(201).send(session);
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  });

  router.post("/sessions/:sessionId/start", SessionHelper.isUserLoggedIn(),
    async (req: Request, res: Response) => {
      try {
        const categoryIds = (req.body.categoryIds as string || "").split(",")
          .map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        const response = await GameSessionService.withSchema(req.schema!)
          .startGameSession(Number(req.params.sessionId), SessionHelper.getCurrentUserId(req), categoryIds);
  
        res.status(200).send(response);
      } catch (error) {
        ErrorUtil.handleError(error, req, res);
      }
    }
  );

  router.post("/sessions/:sessionId/next-round", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
    try {
      const result = await GameSessionService.withSchema(req.schema!)
        .startNextRound(Number(req.params.sessionId), SessionHelper.getCurrentUserId(req));

      res.status(200).send(result);
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  });
  

export default router;

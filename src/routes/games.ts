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

router.get("/code/:code", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!;
      const code = req.params.code;

      const game = await GameService
        .withSchema(schema)
        .getGameByCode(code);

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
  
  /**
   * Join game session (PARTICIPANT)
   */
  router.get("/join/:code", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
    try {
      const session = await GameSessionService
        .withSchema(req.schema!)
        .joinByCode(req.params.code);
  
      res.status(200).send(session);
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  });
  
  /**
   * End game session
   */
  router.post("/:id/end", SessionHelper.isUserLoggedIn(), async (req: Request, res: Response) => {
    try {
      await GameSessionService
        .withSchema(req.schema!)
        .endSession(Number(req.params.id));
  
      res.status(200).send({ message: "Game session ended" });
    } catch (error) {
      ErrorUtil.handleError(error, req, res);
    }
  });
  

export default router;

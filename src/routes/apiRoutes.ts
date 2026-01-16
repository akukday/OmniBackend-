import { Application } from "express";
import auth from "./auth";
import games from "./games";
import team from "./team";
import player from "./players";
import question from "./question";
import questionOption from "./questionOption";

export class ApplicationRoutes {

    public registerAuthRoutes(app: Application): void {
        app.use("", auth);
    }

    public registerApplicationRoutes(app: Application): void {
        app.use("/games", games);
        app.use("/team", team);
        app.use("/player", player);
        app.use("/question", question);
        app.use("/answer", questionOption);
    }
}

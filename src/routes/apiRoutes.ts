import { Application } from "express";
import auth from "./auth";

export class ApplicationRoutes {

    public registerAuthRoutes(app: Application): void {
        app.use("", auth);
    }

    public registerApplicationRoutes(app: Application): void {

    }
}

import { NextFunction, Request, Response } from "express";
import _ from "lodash";

class SessionHelper {
    static getCurrentUserId(req: Request): string {
        return _.get(req, 'user.id', '');
    }

    static getCurrentUserEmail(req: Request): string {
        return _.get(req, 'user.email', '');
    }

    public static isUserLoggedIn() {
        return function secured(req: Request, res: Response, next: NextFunction) {
            if (req.isAuthenticated()) {
                return next();
            } else {
                res.status(401).send({ ERRMSG: 'User Not Authenticated' });
            }
        };
    }

    public static setResponseHeader() {
        return function setJsonResponse(req, res, next) {
            res.set({ 'Content-Type': 'application/json', });
            return next();
        };
    }

    public static disableExpressHeader() {
        return function disablePoweredByHeader(req, res, next) {
            res.removeHeader('X-Powered-By');
            return next();
        };
    }

    public static rejectRequestExceptCRUD() {
        return function disableRequestMethod(req, res, next) {
            const method = ['GET', 'POST', 'PUT', 'DELETE'];
            if (method.findIndex(x => x &&
                x.toString().toUpperCase() == req.method.toString().toUpperCase()) != -1) {
                return next();
            } else {
                res.status(405);
                res.end();
            }
        };
    }
}

export { SessionHelper };

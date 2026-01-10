import  { Request, Response }  from "express";

class RequestResponseUtil {
    constructor() {}

    public static clearCookie(req: Request, res: Response) {
        for (var prop in req.cookies) {
            req.cookies[prop] = '';
            res.cookie(prop, '', {expires: new Date(0)});
        }
    }
}

export {RequestResponseUtil};

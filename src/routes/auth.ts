import { Router, Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import passport from "passport";
import { RequestResponseUtil } from "../util/requestResponseUtil";
import { UniqueConstraintError } from "sequelize";
import { ErrorUtil } from "../util/errorUtil";
import { SessionHelper } from "../common/middleware/sessionHelper";
import { AccountService } from "../service/account";
import _ from "lodash";
import { schemaResolver } from "../db/schemaResolver";
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.google_client_id);

const router = Router({
    strict: true,
    caseSensitive: false,
});
router.use(schemaResolver);

router.post('/login', [check('email').notEmpty().withMessage('Email can not be empty'),
    check('password').notEmpty().withMessage('Password can not be empty')], 
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }
        passport.authenticate('email', function (err, user) {
            if (err) {
                console.error(err);
                RequestResponseUtil.clearCookie(req, res)
                res.status(401).send({ ERRMSG: err.message });
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        res.status(401).send({ ERRMSG: err.message });
                    }
                });
                console.log(`User ${user.email} logged in successfully`);
                res.status(200).send(user);
            }
        })(req, res, next);
});

router.post('/login-phone', [check('phoneNo').notEmpty().withMessage('Phone no. can not be empty'),
    check('password').notEmpty().withMessage('Password can not be empty')], 
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }
        passport.authenticate('phone', function (err, user) {
            if (err) {
                console.error(err);
                RequestResponseUtil.clearCookie(req, res)
                res.status(401).send({ ERRMSG: err.message });
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        res.status(401).send({ ERRMSG: err.message });
                    }
                });
                console.log(`User ${user.email} logged in successfully`);
                res.status(200).send(user);
            }
        })(req, res, next);
});

router.post('/google-login', [check('accessToken').notEmpty().withMessage('Token can not be empty')], 
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }

        passport.authenticate('googleLoginStrategy', function (err, user) {
            if (err) {
                console.error(err);
                RequestResponseUtil.clearCookie(req, res)
                res.status(401).send({ ERRMSG: err.message });
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        res.status(401).send({ ERRMSG: err.message });
                    }
                });
                console.log(`User ${user.email} logged in successfully`);
                res.status(200).send(user);
            }
        })(req, res, next);
});

router.post('/apple-login', [check('idToken').notEmpty().withMessage('Token can not be empty')], 
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }

        passport.authenticate('appleLoginStrategy', function (err, user) {
            if (err) {
                console.error(err);
                RequestResponseUtil.clearCookie(req, res)
                res.status(401).send({ ERRMSG: err.message });
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        res.status(401).send({ ERRMSG: err.message });
                    }
                });
                console.log(`User ${user.email} logged in successfully`);
                res.status(200).send(user);
            }
        })(req, res, next);
});

router.post('/login/send-otp', [check('phoneNo').notEmpty().withMessage('Phoneno can not be empty')], 
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
            }
            const phoneNumber: string = _.get(req.body, 'phoneNo')?.toString() ?? "";
            const countryCode: string = _.get(req.body, 'countryCode')?.toString() ?? "1";
        
            const result = await AccountService.withSchema(req.schema!).validateAndSendOtp(countryCode, `${phoneNumber}`);
            res.status(200).send({ result });
        } catch (error) {
            res.status(500).send({ ERRMSG: (error as Error).message });
        }
});

router.post('/login/otp', [check('phoneNo').notEmpty().withMessage('Phoneno can not be empty'),
    check('otp').notEmpty().withMessage('OTP can not be empty')], 
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }
        passport.authenticate('otp', function (err, user) {
            if (err) {
                console.error(err);
                RequestResponseUtil.clearCookie(req, res)
                res.status(401).send({ ERRMSG: err.message });
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        res.status(401).send({ ERRMSG: err.message });
                    }
                });
                console.log(`User ${user.email} logged in successfully`);
                res.status(200).send(user);
            }
        })(req, res, next);
});

router.post("/onboard", [check('phoneNo').notEmpty().withMessage('Phone Number can not be blank'),
    check('password').notEmpty().withMessage('Password can not be blank'),
    check('fullName').notEmpty().withMessage('All fields are required')
    ], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ ERRMSG: errors.array().map(x => x.msg).toString() });
        }
        RequestResponseUtil.clearCookie(req, res)
        passport.authenticate('onboardStrategy', function (err, user) {
          if (err) {
              console.error(err);
              RequestResponseUtil.clearCookie(req, res)
              res.status(401).send({ ERRMSG: err.message });
          } else {
            req.logIn(user, (err) => {
                if (err) {
                  res.status(401).send({ ERRMSG: err.message });
                }
            });
            console.log(`User ${user.email} logged in successfully`);
            res.status(200).send(user);
          }
      })(req, res, next);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            res.status(500).send({ ERRMSG: ErrorUtil.sequelizeError(error) });
        } else {
            res.status(500).send({ ERRMSG: (error as Error).message });
        }
    }
})

router.get('/validate-session', SessionHelper.isUserLoggedIn(), 
    async(req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({});
    } catch (error) {
        res.status(500).send({ ERRMSG: (error as Error).message});
    }
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    RequestResponseUtil.clearCookie(req, res);
    req.session.destroy((err) => {
        if (err) {
            console.log(`Error Occurred while logging out user ${err && err.message}`);
            res.status(500).send({ ERRMSG: err.message });
        } else {
            res.set("X-REF-TOKEN", "")
            console.log(`Successfully logged out`);
            res.status(200).send({ MSG: 'Thank You' });
        }
    });
});

router.post('/delete', SessionHelper.isUserLoggedIn(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = SessionHelper.getCurrentUserId(req);
        RequestResponseUtil.clearCookie(req, res);
        await AccountService.withSchema(req.schema!).deleteAccount(userId)
        res.status(200).send({status: "success"});
    } catch (error) {
        res.status(500).send({ ERRMSG: (error as Error).message });
    }
});

export default router;

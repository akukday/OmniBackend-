import "./types/express/express";
import express, { Application, Request, Response, NextFunction } from "express";
import lodash from "lodash";
import bodyParser from "body-parser";
//session-related libraries
import passport from "passport";
import { Strategy } from "passport-local";
import { Pool } from "pg";
import cookieParser from "cookie-parser";
import { StringUtil } from "./util/stringUtil";
import { SessionHelper } from "./common/middleware/sessionHelper";
import {schemaResolver} from "./db/schemaResolver";
import { AccountService } from "./service/account";

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.google_client_id);

// Application imports
import { ApplicationRoutes } from "./routes/apiRoutes";

class App {
  public app: Application;
  public appRoutes: ApplicationRoutes = new ApplicationRoutes();

  constructor() {
    this.app = express();
    this.config();
    this.initiateSessionModules();
    this.registerPublicRoutes();
    this.appRoutes.registerAuthRoutes(this.app);
    this.appRoutes.registerApplicationRoutes(this.app);
  }

  private registerPublicRoutes(): void {
    this.app.get('/status', async (req: Request, res: Response) => {
      res.status(200).send("Healthy!!!");
    });
  }

  private config(): void {
    this.app.set("trust proxy", true);
    this.app.use(schemaResolver); // VERY IMPORTANT (hostname-based)

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Expose-Headers", "Set-Cookie, X-REF-TOKEN, Cookie, Origin");
      res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, X-REF-TOKEN, Access-Control-Allow-Headers, Authorization, X-Requested-With, Set-Cookie, X-Requested-With, X-HTTP-Method-Override, Origin");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("SameSite", "None");
      res.header("secure", "true");
      if('OPTIONS' == req.method) {
        res.send(200)
      } else {
        next();
      }
    });

    const getDurationInMilliseconds = (start) => {
      const NS_PER_SEC = 1e9
      const NS_TO_MS = 1e6
      const diff = process.hrtime(start)
      return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
    }
    this.app.use((req, res, next) => {
      const start = process.hrtime()
      res.on('finish', () => {            
          const durationInMilliseconds = getDurationInMilliseconds (start)
          const ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
          console.info(`${SessionHelper.getCurrentUserId(req)} - `+
            `${ip} - `+
            `${res.statusCode} - `+
            `${req.method} - `+
            `${req.originalUrl} - `+
            `[FINISHED] - `+
            `${durationInMilliseconds.toLocaleString()} ms`)
      })
      next()
    })
    this.app.use(cookieParser());
    // Dynamic CORS options
    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || origin.includes('event-platform.org') || origin.includes('localhost')) {
          // Allow requests with no origin (e.g., mobile apps or Postman)
          callback(null, true);
        } else {
          // Reject requests from unknown origins
          callback(new Error('Not allowed by CORS '+ origin));
        }
      },
      credentials: true // Allow cookies to be sent and received
    };
    this.app.use(cors(corsOptions))
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private initiateSessionModules(): void {
    const pgPool = new Pool({
      host: process.env.sql_host,
      user: process.env.sql_username,
      password: process.env.sql_password,
      port: Number(process.env.sql_port),
      database: process.env.sql_database
    });


    const emailStrategy = new Strategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: true
      }, async (req, email, password, callBack) => {
        try {
          const isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticated(email.toLowerCase(), password, "", "");
          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
    });
    const phoneStrategy = new Strategy(
      {
        usernameField: 'phoneNo',
        passwordField: 'password',
        passReqToCallback: true,
        session: true
      }, async (req, phoneNo, password, callBack) => {
        try {
          const isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticated("", password, "", phoneNo);
          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
    });
    const otpStrategy = new Strategy(
      {
        usernameField: 'phoneNo',
        passwordField: 'otp',
        passReqToCallback: true,
        session: true
      }, async (req, phoneNo, otp, callBack) => {
        try {
          const countryCode = lodash.get(req.body, 'countryCode', "1");
          const isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticatedOTP(countryCode, phoneNo, otp);
          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
      });
      
    const onboardStrategy = new Strategy(
      {
        usernameField: 'phoneNo',
        passwordField: 'password',
        passReqToCallback: true,
        session: true
      }, async (req, _email, password, callBack) => {
        try {
          const email = req.body?.email || "";
          const phoneNo = req.body?.phoneNo || "";
          const account = await AccountService.withSchema(req.schema!);
          await account.registerUser(req.body);
          const isAuthenticated = await account.isAuthenticated(email.toLowerCase(), password, "", phoneNo);
          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
    });
    const googleLoginStrategy = new Strategy(
      {
        usernameField: 'accessToken',
        passwordField: 'accessToken',
        passReqToCallback: true,
        session: true
      }, async (req, accessToken, password, callBack) => {
        try {
          const ticket = await googleClient.getTokenInfo(req.body.accessToken);
          const email = ticket.email;
          let isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticatedEmail(email);
          if(!isAuthenticated) {
            const name = StringUtil.extractNameFromEmail(email)
            await AccountService.withSchema(req.schema!).registerUser({email: email, fullName: name, displayName: name, phoneNo: ""} as any);
          }

          isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticatedEmail(email);
          if(!isAuthenticated) {
            throw new Error("Invalid email");
          }

          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
    });
    const appleLoginStrategy = new Strategy(
      {
        usernameField: 'idToken',
        passwordField: 'idToken',
        passReqToCallback: true,
        session: true
      }, async (req, idToken, password, callBack) => {
        try {
          const user = await AccountService.withSchema(req.schema!).verifyAppleCreds(req.body.idToken);
          const email = user.email;
          let isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticatedEmail(email);
          if(!isAuthenticated) {
            const name = StringUtil.extractNameFromEmail(email)
            await AccountService.withSchema(req.schema!).registerUser({email: email, fullName: name, displayName: name, phoneNo: ""} as any);
          }
          isAuthenticated = await AccountService.withSchema(req.schema!).isAuthenticatedEmail(email);
          if(!isAuthenticated) {
            throw new Error("Invalid email");
          }
          
          callBack(null, isAuthenticated);
        } catch (error) {
          callBack(error);
        }
    });
    passport.use('email', emailStrategy);
    passport.use('phone', phoneStrategy);
    passport.use('otp', otpStrategy);
    passport.use('onboardStrategy', onboardStrategy);
    passport.use('googleLoginStrategy', googleLoginStrategy);
    passport.use('appleLoginStrategy', appleLoginStrategy);
    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user: Express.User, done) {
      done(null, user);
    });

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const sess = {
        name: `sid_${req.schema}`,
        store: new pgSession({
          pool: pgPool,
          tableName: "user_sessions",
          schemaName: req.schema,
          pruneSessionInterval: false
        }), 
        secret: process.env.SESSION_SECRET,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000,  //TODO: Right now cookie expiration is set to 30 days, ideally a refresh token apporach should be taken
          SameSite: 'None'
        },
        resave: false,
        sameSite: 'None',
        saveUninitialized: false
      };
      session(sess)(req, res, next)
    });

    //this.app.use(session(sess));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }
}

export default new App().app;

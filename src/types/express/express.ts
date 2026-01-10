import "express";
import "express-session";

declare global {
  namespace Express {
    interface Request {
      schema?: string;
      session: import("express-session").Session & Partial<import("express-session").SessionData>;
    }
  }
}

export {};


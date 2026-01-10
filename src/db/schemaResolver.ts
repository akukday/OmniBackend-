import { Request, Response, NextFunction } from "express";

/**
 * Strict whitelist
 */
const SCHEMA_MAP: Record<string, string> = {
  wedding: "wedding_shower",
  baby: "baby_shower"
};

/**
 * Hostname → schema mapping
 */
const HOST_SCHEMA_MAP: Record<string, string> = {
  "wedding-shower.plan-event.org": "wedding",
  "baby-shower.plan-event.org": "baby",

  // local dev
  "wedding": "wedding",
  "baby": "baby"
};

export function schemaResolver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let schema: string | undefined;

  // HOSTNAME
  const host = req.hostname.toLowerCase();
  schema = HOST_SCHEMA_MAP[host];
  
  // QUERY PARAM
  if (!schema && typeof req.query.schema === "string") {
    const querySchema = req.query.schema;
    if (SCHEMA_MAP[querySchema]) {
      schema = SCHEMA_MAP[querySchema];
    }
  }

  // HEADER (highest priority) (fallback)
  if (!schema) {
    const headerSchema = req.header("x-tenant");

    if (headerSchema && SCHEMA_MAP[headerSchema]) {
      schema = SCHEMA_MAP[headerSchema];
    }
  }

  if (!schema) {
    return res.status(400).json({
      message: "Invalid or missing schema"
    });
  }

  req.schema = schema;
  next();
}

import { Request, Response } from "express";
import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";

class ErrorUtil {

    constructor() {}

    public static sequelizeError(error: any, defaultMessage? :string) {
        defaultMessage = defaultMessage ? defaultMessage : "Error occurred"
        return (error.parent?.["detail"] || error.message || defaultMessage).replace(/_/g, " ")
    }

    public static handleError(error: any, req: Request, res: Response): Response {
        console.error("❌ ERROR:", {
          message: error?.message,
          name: error?.name,
          stack: error?.stack
        });
    
        /**
         * Sequelize: Unique constraint
         */
        if (error instanceof UniqueConstraintError) {
          return res.status(409).send({
            ERRMSG: error.errors?.map(e => e.message).join(", ") || "Duplicate record"
          });
        }
    
        /**
         * Sequelize: Foreign key violation
         */
        if (error instanceof ForeignKeyConstraintError) {
          return res.status(400).send({
            ERRMSG: "Invalid reference data"
          });
        }
    
        /**
         * Sequelize: Validation errors
         */
        if (error instanceof ValidationError) {
          return res.status(400).send({
            ERRMSG: error.errors.map(e => e.message).join(", ")
          });
        }
    
        /**
         * Custom / Business logic errors
         */
        if (error instanceof Error) {
          return res.status(400).send({
            ERRMSG: error.message
          });
        }
    
        /**
         * Fallback – unknown errors
         */
        return res.status(500).send({
          ERRMSG: "Internal server error"
        });
      }

}

export { ErrorUtil };

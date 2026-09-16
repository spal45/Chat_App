import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

interface ValidationSchemas {
    body?: ZodType;
    params?: ZodType;
}

export const validate = (schemas: ValidationSchemas) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params) as typeof req.params;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    message: "Invalid request data",
                    errors: error.issues.map((issue) => ({
                        path: issue.path.join("."),
                        message: issue.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};

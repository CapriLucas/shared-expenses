import { Request, Response, NextFunction } from "express";
import {
  ValidationChain,
  validationResult,
  ValidationError,
} from "express-validator";

interface FormattedError {
  field: string;
  message: string;
}

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors: FormattedError[] = errors
      .array()
      .map((err: ValidationError) => ({
        field: err.type === "field" ? err.path : err.type,
        message: err.msg,
      }));

    res.status(400).json({
      errors: formattedErrors,
    });
  };
};

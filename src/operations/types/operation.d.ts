import type { NextFunction, Request, Response } from "express";

export type OperationHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface ApiOperation {
  middleware: OperationHandler[];
  handler: OperationHandler;
}

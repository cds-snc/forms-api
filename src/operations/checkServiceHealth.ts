import type { Request, Response } from "express";
import type { ApiOperation } from "@operations/types/operation.js";

function main(_: Request, response: Response): void {
  response.json({
    status: "running",
  });
}

export const checkServiceHealthOperation: ApiOperation = {
  middleware: [],
  handler: main,
};

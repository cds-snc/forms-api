import type { ApiOperation } from "@operations/types/operation.js";
import type { Request, Response } from "express";

function main(_: Request, response: Response): void {
  response.json({
    status: "running",
  });
}

export const checkServiceHealthOperation: ApiOperation = {
  middleware: [],
  handler: main,
};

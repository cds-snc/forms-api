import { NextFunction, Request, Response } from "express";

async function main(request: Request, response: Response, next: NextFunction) {
  next();
}

export default main;

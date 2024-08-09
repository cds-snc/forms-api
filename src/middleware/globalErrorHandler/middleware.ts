import { Request, Response, NextFunction } from "express";

function main(error: Error, _request: Request, response: Response, _next: NextFunction) {
  console.log(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  response.sendStatus(500);
}

export default main;

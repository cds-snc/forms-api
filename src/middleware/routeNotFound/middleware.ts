import { Request, Response } from "express";

function main(_request: Request, response: Response) {
  response.sendStatus(404);
}

export default main;

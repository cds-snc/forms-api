import { vi } from "vitest";
import type { Response } from "express";

export function buildMockedResponse() {
  const response = {} as Response;

  response.sendStatus = vi.fn();
  response.json = vi.fn().mockReturnValue(response);
  response.status = vi.fn().mockReturnValue(response);

  return response;
}

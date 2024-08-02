import { describe, expect, it, vi } from "vitest";
import app from "../app";
import "../server";

vi.mock("../app", () => {
  return {
    default: {
      listen: vi.fn(),
    },
  };
});

describe("Server", () => {
  it("should start the server on the default port", () => {
    expect(app.listen).toHaveBeenCalledWith(3001, expect.any(Function));
  });
});

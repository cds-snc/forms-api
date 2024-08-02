import { describe, expect, it, jest } from "@jest/globals";
import app from "../app";
import "../server";

jest.mock("../app", () => ({
  listen: jest.fn(),
}));

describe("Server", () => {
  it("should start the server on the default port", () => {
    expect(app.listen).toHaveBeenCalledWith(3001, expect.any(Function));
  });
});

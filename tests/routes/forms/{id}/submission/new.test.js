import { describe, expect, it, vi } from "vitest";
import handler from "../../../../../api/v1/routes/forms/{id}/submission/new";

describe("GET handler", () => {
  it("should return a submission with status 200", () => {
    const req = {
      params: {
        id: "123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    handler().GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "123",
      submission: "My form response",
    });
  });
});

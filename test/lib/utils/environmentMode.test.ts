import { describe, it, expect } from "vitest";
import {
  EnvironmentMode,
  getEnvironmentModeFromRequestHostHeader,
} from "@lib/utils/environmentMode";

describe("getEnvironmentModeFromRequestHostHeader should", () => {
  it.each([
    [undefined, EnvironmentMode.Local],
    ["undefined", EnvironmentMode.Production],
    ["", EnvironmentMode.Local],
    ["forms-staging.cdssandbox.xyz", EnvironmentMode.Staging],
    ["localhost:3001", EnvironmentMode.Local],
    ["forms-formulaires.alpha.canada.ca", EnvironmentMode.Production],
  ])(
    "return the right EnvironmentMode depending on the provided host (testing %s)",
    (host: string | undefined, expectedEnvironmentMode: EnvironmentMode) => {
      const environmentMode = getEnvironmentModeFromRequestHostHeader(host);
      expect(environmentMode).toBe(expectedEnvironmentMode);
    },
  );
});

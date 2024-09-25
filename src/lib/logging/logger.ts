import pino from "pino";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@config";

export const logMessage = pino.default({
  level: ENVIRONMENT_MODE === EnvironmentMode.Local ? "debug" : "info",

  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(ENVIRONMENT_MODE === EnvironmentMode.Local && {
    transport: {
      target: "pino-pretty",
    },
  }),

  base: null,
});

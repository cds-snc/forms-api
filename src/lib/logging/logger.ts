import { ENVIRONMENT_MODE, EnvironmentMode } from "@config";
import pino from "pino";

export const logMessage = pino({
  level: ENVIRONMENT_MODE === EnvironmentMode.local ? "debug" : "info",

  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(ENVIRONMENT_MODE === EnvironmentMode.local && {
    transport: {
      target: "pino-pretty",
    },
  }),

  base: null,
});

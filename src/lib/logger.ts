import pino from "pino";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";

export const logMessage = pino.default({
  level: ENVIRONMENT_MODE === EnvironmentMode.Local ? "debug" : "info",

  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
    },
  }),

  base: null,
});
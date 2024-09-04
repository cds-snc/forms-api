import pino from "pino";


export const logMessage = pino.default({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",

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
import { logger } from "hono-pino";
import pino from "pino";

import env from "@/env";

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: "logs/combined.log", mkdir: true },
    },
    {
      level: "error",
      target: "pino/file",
      options: { destination: "logs/error.log", mkdir: true },
    },
    {
      target: env.NODE_ENV === "production" ? "pino/file" : "pino-pretty",
    },
  ],
});

export const customLogger = pino(
  {
    level: env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);

export function pinoLogger() {
  return logger({
    pino: customLogger,
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}

import type { ErrorHandler } from "hono";
import type { z } from "zod";

import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import type { ErrorSchema } from "../schema/error-object.schema";

import * as HTTP_CODE from "../utils/http-status-codes.util";
import * as HTTP_PHRASE from "../utils/http-status-phrases.util";

export const onErrorMiddleware: ErrorHandler = (err: Error, c): Response => {
  const logger = c.get("logger");

  /**
   * Zod errors are 400 as they are client errors mostly
   */
  if (err instanceof ZodError) {
    logger.error(
      {
        success: false,
        message: err.message,
        name: err.name,
        status: HTTP_PHRASE.BAD_REQUEST,
        code: HTTP_CODE.BAD_REQUEST,
        errorObj: err,
      },
      "returning 400 Zod error",
    );

    return c.json<z.infer<typeof ErrorSchema>>(
      {
        error: {
          success: false,
          code: HTTP_CODE.BAD_REQUEST,
          docs: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${HTTP_CODE.BAD_REQUEST}`,
          message: err.message,
          requestId: c.get("requestId"),
        },
      },
      { status: HTTP_CODE.BAD_REQUEST },
    );
  }

  /**
   * HTTPExceptions
   */
  if (err instanceof HTTPException) {
    logger.error(
      {
        success: false,
        message: err.message,
        cause: err.cause,
        stack: err.stack,
        status: err.status,
        requestId: c.get("requestId"),
        errorObj: err,
      },
      "HTTPException",
    );
    return c.json<z.infer<typeof ErrorSchema>>(
      {
        error: {
          success: false,
          code: err.status,
          docs: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${err.status}`,
          message: err.message,
          requestId: c.get("requestId"),
        },
      },
      { status: err.status },
    );
  }

  /**
   * We're lost here, all we can do is return a 500 and log it to investigate
   */
  logger.error(
    {
      success: false,
      name: err.name,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
      requestId: c.get("requestId"),
    },
    "unhandled exception",
  );
  return c.json<z.infer<typeof ErrorSchema>>(
    {
      error: {
        success: false,
        code: HTTP_CODE.INTERNAL_SERVER_ERROR,
        docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500",
        message: err.message ?? "something unexpected happened",
        requestId: c.get("requestId"),
      },
    },
    { status: HTTP_CODE.INTERNAL_SERVER_ERROR },
  );
};

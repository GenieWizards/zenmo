import z from "zod";

import * as HTTP_STATUS from "../utils/http-status-codes.util";

export const ErrorCode = z.nativeEnum(HTTP_STATUS);

export const ErrorSchema = z.object({
  error: z.object({
    success: z.boolean(),
    code: z.number(),
    docs: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorSchema>;

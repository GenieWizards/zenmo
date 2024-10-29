import { z } from "@hono/zod-openapi";

export function createMessageObjectSchema(
  exampleMessage: string = "Hello World",
  exampleSuccess: boolean = true,
) {
  return z
    .object({
      success: z.boolean(),
      message: z.string(),
    })
    .openapi({
      example: {
        success: exampleSuccess,
        message: exampleMessage,
      },
    });
}

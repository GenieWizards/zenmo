import type { ZodSchema } from "../lib/types";

import { jsonContent } from "./json-content.helper";

function jsonContentRequired<
  T extends ZodSchema,
>(schema: T, description: string) {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
}

export default jsonContentRequired;

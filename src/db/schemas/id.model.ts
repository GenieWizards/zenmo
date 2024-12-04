import { z } from "zod";

export const idSchema = z.string()
  .min(32, { message: "ID must be at least 32 characters" })
  .max(60, { message: "ID must be at most 60 characters" })
  .describe("Unique identifier of the record");

export type TIdSchema = z.infer<typeof idSchema>;

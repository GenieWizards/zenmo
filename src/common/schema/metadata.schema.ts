import { z } from "zod";

export const metadataSchema = z.object({
  total: z.number().int().nonnegative().describe("Total number of records"),
  page: z.number().int().positive().describe("Current page number"),
  limit: z.number().int().positive().describe("Number of items per page"),
  totalPages: z.number().int().nonnegative().describe("Total number of pages"),
  hasNextPage: z.boolean().describe("Whether there is a next page"),
  hasPrevPage: z.boolean().describe("Whether there is a previous page"),
  // Optional additional metadata fields that might be useful
  offset: z.number().int().nonnegative().optional().describe("Current offset"),
  count: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Number of items in current page"),
});

export type TMetadata = z.infer<typeof metadataSchema>;

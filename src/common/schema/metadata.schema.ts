import { z } from "zod";

export const metadataSchema = z.object({
  total: z.number().int().nonnegative().describe("Total number of records"),
  page: z.number().int().positive().optional().describe("Current page number"),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Number of items per page"),
  sortBy: z.string().optional().describe("Field to sort by"),
  sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort order"),
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
export type TQueryMetadataSchema = Omit<
  TMetadata,
  "total" | "totalPages" | "hasNextPage" | "hasPrevPage" | "count"
>;

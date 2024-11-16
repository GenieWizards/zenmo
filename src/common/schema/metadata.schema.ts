import { z } from "zod";

export const metadataSchema = z.object({
  totalCount: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Total number of records"),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .describe("Current page number"),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .describe("Number of items per page"),
  search: z.string().optional().describe("Search query"),
  sortBy: z
    .string()
    .default("createdAt")
    .optional()
    .describe("Field to sort by"),
  sortOrder: z
    .enum(["asc", "desc"])
    .default("asc")
    .optional()
    .describe("Sort order"),
  totalPages: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Total number of pages"),
  hasNextPage: z.boolean().optional().describe("Whether there is a next page"),
  hasPrevPage: z
    .boolean()
    .optional()
    .describe("Whether there is a previous page"),
  // Optional additional metadata fields that might be useful
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Current offset"),
  currentCount: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Number of items in current page"),
});

export const commonQuerySchema = metadataSchema.omit({
  totalCount: true,
  totalPages: true,
  hasNextPage: true,
  hasPrevPage: true,
  currentCount: true,
});

export type TMetadata = z.infer<typeof metadataSchema>;
export type TCommonQueryMetadata = Omit<
  TMetadata,
  "totalCount" | "totalPages" | "hasNextPage" | "hasPrevPage" | "currentCount"
>;

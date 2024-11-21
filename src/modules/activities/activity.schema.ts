import { z } from "zod";

import { commonQuerySchema } from "@/common/schema/metadata.schema";

export const activityQuerySchema = commonQuerySchema
  .omit({ search: true })
  .merge(
    z.object({
      userId: z.string().optional().describe("Filter by user ID"),
      resourceType: z
        .enum(["category", "expense", "user", "group"])
        .optional()
        .describe("Filter by resource type"),
      action: z
        .enum(["create", "update", "delete"])
        .optional()
        .describe("Filter by action type"),
      sortBy: z
        .enum(["createdAt", "resourceType", "action"])
        .optional()
        .default("createdAt")
        .describe("Sort by field"),
    }),
  );

export type TActivityQuery = z.infer<typeof activityQuerySchema>;

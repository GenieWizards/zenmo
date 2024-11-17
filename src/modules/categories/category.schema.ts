import { z } from "zod";

import { commonQuerySchema } from "@/common/schema/metadata.schema";

export const categoryQuerySchema = commonQuerySchema.merge(
  z.object({
    isActive: z
      .union([z.boolean(), z.enum(["true", "false"]), z.enum(["0", "1"])])
      .transform((val) => {
        if (typeof val === "string") {
          return val === "true" || val === "1";
        }
        return val;
      })
      .optional()
      .describe("Filter by active status"),
    sortBy: z
      .enum(["name", "createdAt", "updatedAt"])
      .optional()
      .default("createdAt")
      .describe("Sort by field"),
  }),
);

export type TCategoryQuery = z.infer<typeof categoryQuerySchema>;

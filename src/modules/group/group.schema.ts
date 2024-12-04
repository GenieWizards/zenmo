import { z } from "zod";

import { commonQuerySchema } from "@/common/schema/metadata.schema";

export const groupQuerySchema = commonQuerySchema.merge(
  z.object({
    status: z
      .enum(["settled", "unsettled"])
      .describe("Filter by status")
      .default("unsettled"),
  }),
);

export type TGroupQuerySchema = z.infer<typeof groupQuerySchema>;

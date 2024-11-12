import type { z } from "zod";

import type { metadataSchema } from "../schema/metadata.schema";

export function generateMetadata({
  total,
  page,
  limit,
}: {
  total: number;
  page: number;
  limit: number;
}): z.infer<typeof metadataSchema> {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    offset: (page - 1) * limit,
    count: Math.min(limit, total - (page - 1) * limit),
  };
}

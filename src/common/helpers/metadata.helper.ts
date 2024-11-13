import type { z } from "zod";

import type { metadataSchema } from "../schema/metadata.schema";

export function generateMetadata({
  totalCount,
  page,
  limit,
}: {
  totalCount: number;
  page: number;
  limit: number;
}): z.infer<typeof metadataSchema> {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    totalCount,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    offset: (page - 1) * limit,
    currentCount: Math.min(limit, totalCount - (page - 1) * limit),
  };
}

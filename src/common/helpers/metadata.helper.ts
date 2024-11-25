import type { z } from "zod";

import type { metadataSchema } from "../schema/metadata.schema";

export function generateMetadata({
  totalCount,
  page,
  limit,
  sortOrder,
  sortBy,
}: {
  totalCount: number;
  page: number;
  limit: number;
  sortOrder?: "asc" | "desc" | undefined;
  sortBy?: string | undefined;
}): z.infer<typeof metadataSchema> {
  const totalPages = Math.ceil(totalCount / limit);
  const currentCount = Math.min(limit, totalCount - (page - 1) * limit);

  return {
    totalCount,
    page,
    limit,
    totalPages,
    sortBy,
    sortOrder,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    offset: (page - 1) * limit,
    currentCount: currentCount > 0 ? currentCount : 0,
  };
}

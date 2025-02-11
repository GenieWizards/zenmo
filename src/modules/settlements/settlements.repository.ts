import type { SQL } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertSettlementSchema } from "@/db/schemas/settlement.model";
import settlementModel from "@/db/schemas/settlement.model";

/**
 * Updates a settlement record in the database.
 *
 * This asynchronous function updates the amount of a settlement record based on the provided payload.
 * It identifies the specific record to update using the settlement ID along with sender and receiver IDs,
 * and includes the group ID in the filter if it is present in the payload.
 *
 * @param payload - An object containing settlement details including amount, senderId, receiverId, and optionally groupId.
 * @param settlementId - The unique identifier of the settlement record to update.
 * @returns A promise that resolves to the updated settlement record.
 */
export async function updateSettlementRepository(
  payload: TInsertSettlementSchema,
  settlementId: string,
) {
  const whereConditions: SQL<unknown>[] = [
    eq(settlementModel.id, settlementId),
    eq(settlementModel.senderId, payload.senderId),
    eq(settlementModel.receiverId, payload.receiverId),
  ];

  if (payload.groupId) {
    whereConditions.push(eq(settlementModel.groupId, payload.groupId));
  }

  const [settlement] = await db
    .update(settlementModel)
    .set({
      amount: payload.amount,
    })
    .where(and(...whereConditions));

  return settlement;
}

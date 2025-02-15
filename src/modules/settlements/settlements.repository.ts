import { and, eq, or } from "drizzle-orm";

import { db } from "@/db/adapter";
import type { TInsertSettlementSchema } from "@/db/schemas/settlement.model";
import settlementModel from "@/db/schemas/settlement.model";

export async function updateSettlementRepository(
  payload: TInsertSettlementSchema,
  settlementId: string,
) {
  const whereConditions = [
    eq(settlementModel.id, settlementId),
    and(
      or(
        eq(settlementModel.senderId, payload.senderId),
        eq(settlementModel.senderId, payload.receiverId),
      ),
      or(
        eq(settlementModel.receiverId, payload.senderId),
        eq(settlementModel.receiverId, payload.receiverId),
      ),
    ),
  ];

  if (payload?.groupId) {
    whereConditions.push(eq(settlementModel.groupId, payload.groupId));
  }

  const [settlement] = await db
    .select()
    .from(settlementModel)
    .where(and(...whereConditions));

  const finalAmount = settlement?.amount - payload.amount;

  if (finalAmount > 0) {
    const [updatedSettlement] = await db
      .update(settlementModel)
      .set({
        amount: finalAmount,
      })
      .where(and(...whereConditions))
      .returning();

    return updatedSettlement;
  }

  if (finalAmount < 0) {
    const updateData = {
      amount: -finalAmount,
      receiverId: payload.senderId,
      senderId: payload.receiverId,
    };

    const [updatedSettlement] = await db
      .update(settlementModel)
      .set(updateData)
      .where(and(...whereConditions))
      .returning();

    return updatedSettlement;
  }
}

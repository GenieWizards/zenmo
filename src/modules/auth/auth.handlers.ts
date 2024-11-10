import { setCookie } from "hono/cookie";

import type { AppRouteHandler } from "@/common/lib/types";

import { AuthRoles } from "@/common/enums";
import { hashPassword } from "@/common/utils/crypto.lib";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { generateSessionToken } from "@/common/utils/sessions.util";
import { db } from "@/db/adapter";
import { accountModel, sessionModel, userModel } from "@/db/schemas";
import env from "@/env";

import type { RegisterRoute } from "./auth.routes";

import { getUserRepository } from "../users/user.repository";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const payload = c.req.valid("json");

  // NOTE: Checks for password strength
  // const strongPassword = await verifyPasswordStrength(payload.password);
  // if (!strongPassword) {
  //   return c.json(
  //     {
  //       success: false,
  //       message: "Password is not strong enough",
  //     },
  //     HTTPStatusCodes.BAD_REQUEST,
  //   );
  // }

  // Check if user exists
  const existingUser = await getUserRepository(payload.email);
  if (existingUser) {
    return c.json(
      {
        success: false,
        message: "Email already registered",
      },
      HTTPStatusCodes.CONFLICT,
    );
  }

  // Create user transaction
  const result = await db.transaction(async (tx) => {
    // 1. Create user
    const [user] = await tx
      .insert(userModel)
      .values({
        email: payload.email.toLowerCase(),
        fullName: payload.fullName,
        role: AuthRoles.USER,
      })
      .returning();

    // 2. Create account with credentials
    const [_account] = await tx
      .insert(accountModel)
      .values({
        userId: user.id,
        providerId: "credentials",
        providerAccountId: user.id, // for credentials, use userId
        password: await hashPassword(payload.password),
      })
      .returning();

    const sessionToken = generateSessionToken();

    // 3. Create session
    const [session] = await tx
      .insert(sessionModel)
      .values({
        id: sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();

    return { user, session };
  });

  // Set session cookie
  setCookie(c, "session", result.session.id, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    expires: result.session.expiresAt,
    sameSite: "lax",
  });

  return c.json(
    {
      success: true,
      message: "Registration successful",
      data: { ...result.user, session: result.session.id },
    },
    201,
  );
};

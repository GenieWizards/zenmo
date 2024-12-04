import type { AppRouteHandler } from "@/common/lib/types";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";

import { createUserRepository } from "./user.repository";
import type { CreateUserRoute } from "./user.routes";

export const createUser: AppRouteHandler<CreateUserRoute> = async (c) => {
  const userPayload = c.req.valid("json");

  const user = await createUserRepository(userPayload);

  if (!user) {
    return c.json(
      {
        success: false,
        message: "Failed to create user",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return c.json(
    {
      success: true,
      message: "User Created Successfully",
      data: user,
    },
    HTTPStatusCodes.CREATED,
  );
};

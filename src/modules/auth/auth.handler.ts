import { setCookie } from "hono/cookie";

import type { AppRouteHandler } from "@/common/lib/types";

import { auth } from "@/common/lib/auth";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import * as HTTPStatusPhrases from "@/common/utils/http-status-phrases.util";

import type { LoginRoute, RegisterRoute, SessionRoute } from "./auth.route";

export const session: AppRouteHandler<SessionRoute> = async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user || !session) {
    return c.json(
      {
        success: false,
        message: HTTPStatusPhrases.NOT_FOUND,
      },
      HTTPStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      success: true,
      message: "Get logged in user details",
      data: {
        user,
        session,
      },
    },
    HTTPStatusCodes.OK,
  );
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const payload = c.req.valid("json");
  const existingUser = c.get("user");

  if (existingUser) {
    return c.json(
      {
        success: false,
        message: "User already logged in",
      },
      HTTPStatusCodes.BAD_REQUEST,
    );
  }

  const data = await auth.api.signUpEmail({
    body: {
      email: payload.email,
      password: payload.password || "",
      name: payload.name || "",
      image: payload.image || "",
    },
  });

  if (!data?.user) {
    return c.json(
      {
        success: false,
        message: "User registration failed",
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  data.session
  && c.header("Set-Cookie", data.session.id, {
    append: true,
  });

  return c.json(
    {
      success: true,
      message: "User registered successfully",
      data: data.user,
    },
    HTTPStatusCodes.CREATED,
  );
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const payload = c.req.valid("json");
  const existingUser = c.get("user");

  if (existingUser) {
    return c.json(
      {
        success: false,
        message: "User already logged in",
      },
      HTTPStatusCodes.BAD_REQUEST,
    );
  }

  let user;

  if (payload?.password) {
    user = await auth.api.signInEmail({
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
  }

  if (!user?.user) {
    return c.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      HTTPStatusCodes.BAD_REQUEST,
    );
  }

  user.session
  && setCookie(c, "session_token", user.session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return c.json(
    {
      success: true,
      message: "User logged in successfully",
      data: user.user,
    },
    HTTPStatusCodes.OK,
  );
};

import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";

import { createApp, createTestApp } from "@/common/lib/create-app.lib";
import env from "@/env";

import { authRouter } from "../auth/auth.index";
import { activityRouter } from "./activity.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const activityClient = testClient(createApp().route("/", activityRouter));

describe("Activities List", () => {
  let sessionToken = "";

  beforeAll(async () => {
    const testAuthRouter = createTestApp(authRouter);

    const userResponse = await testAuthRouter.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "user1@yopmail.com",
        password: "ksjhdfjh&*^&%^5675",
      }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    const userResult = await userResponse.json();

    // @ts-expect-error session is available
    sessionToken = userResult.data.session;
  });

  beforeEach(async () => {
    const testAuthRouter = createTestApp(authRouter);

    const userResponse = await testAuthRouter.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user1@yopmail.com",
        password: "ksjhdfjh&*^&%^5675",
      }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    const userResult = await userResponse.json();

    // @ts-expect-error session is available
    sessionToken = userResult.data.session;
  });

  it("should return logged in users list of activities", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {},
      },
      {
        headers: {
          session: sessionToken,
        },
      },
    );

    if (response.status === 200) {
      const json = await response.json();

      expect(json.data).toBeArray();
    }
  });

  it("should return 401 when user is not logged in", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {},
      },
      {
        headers: {
          session: "invalid-session-token",
        },
      },
    );

    expect(response.status).toBe(401);

    if (response.status === 401) {
      const json = await response.json();

      expect(json.message).toBe("You are not authorized, please login");
    }
  });

  it("should return activities with correct metadata structure", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {
          page: 1,
          limit: 10,
        },
      },
      {
        headers: {
          session: sessionToken,
        },
      },
    );

    if (response.status === 200) {
      const json = await response.json();

      expect(json.metadata).toHaveProperty("page");
      expect(json.metadata).toHaveProperty("limit");
      expect(json.metadata).toHaveProperty("totalCount");
    }
  });

  it("should return empty array when no activities exist", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {},
      },
      {
        headers: {
          session: sessionToken,
        },
      },
    );

    if (response.status === 200) {
      const json = await response.json();

      expect(json.data).toBeArray();
      expect(json.data).toHaveLength(0);
    }
  });

  it("should properly handle pagination parameters", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {
          page: 2,
          limit: 5,
        },
      },
      {
        headers: {
          session: sessionToken,
        },
      },
    );

    if (response.status === 200) {
      const json = await response.json();

      expect(json.metadata.page).toBe(2);
      expect(json.metadata.limit).toBe(5);
    }
  });

  it("should handle invalid page numbers gracefully", async () => {
    const response = await activityClient.activities.$get(
      {
        query: {
          page: -1,
          limit: 10,
        },
      },
      {
        headers: {
          session: sessionToken,
        },
      },
    );

    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.success).toBe(false);
  });
});

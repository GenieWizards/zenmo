import { beforeEach, describe, expect, it } from "bun:test";
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

  beforeEach(async () => {
    const testAuthRouter = createTestApp(authRouter);

    const userResponse = await testAuthRouter.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user1@yopmail.com",
        password: "12345678",
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
});

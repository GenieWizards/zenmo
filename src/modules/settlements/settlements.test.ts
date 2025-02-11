import { beforeAll, describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";

import { AuthRoles } from "@/common/enums";
import { createApp } from "@/common/lib/create-app.lib";
import { AUTHORIZATION_ERROR_MESSAGE } from "@/common/utils/constants";
import { createTestUser } from "@/common/utils/test.util";
import env from "@/env";

import { settlementsRouter } from "./settlements.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const settlementsClient = testClient(createApp().route("/", settlementsRouter));

describe("settlements", () => {
  let userSessionToken = "";
  let adminSessionToken = "";
  const settlementId = "";

  beforeAll(async () => {
    const testUser = await createTestUser({
      email: "settlements@sample.com",
      password: "12345678",
      role: AuthRoles.USER,
      fullName: "Test User",
    });

    userSessionToken = testUser.session;

    const adminUser = await createTestUser({
      email: "settlementsAdmin@sample.com",
      password: "12345678",
      role: AuthRoles.ADMIN,
      fullName: "Test Admin",
    });

    adminSessionToken = adminUser.session;
  });

  describe("PATCH /settlements/:settlementId", () => {
    it("should return 404 when settlement with given id not found", async () => {
      const response = await settlementsClient.settlements[
        ":settlementId"
      ].$patch({
        param: {
          settlementId,
        },
        json: {
          amount: 100,
          receiverId: "123",
          senderId: "456",
        },
      });

      expect(response.status).toBe(404);

      if (response.status === 404) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Settlement not found");
      }
    });

    it("should return 401 when user is not logged in", async () => {
      const response = await settlementsClient.settlements[
        ":settlementId"
      ].$patch({
        param: {
          settlementId,
        },
        json: {
          amount: 100,
          receiverId: "123",
          senderId: "456",
        },
      });

      expect(response.status).toBe(401);

      if (response.status === 401) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(AUTHORIZATION_ERROR_MESSAGE);
      }
    });
  });
});

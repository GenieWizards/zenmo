import { $ } from "bun";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";

import { AuthRoles } from "@/common/enums";
import { createApp } from "@/common/lib/create-app.lib";
import { createTestUser } from "@/common/utils/test.util";
import env from "@/env";

import { categoryRouter } from "./category.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const categoryClient = testClient(createApp().route("/", categoryRouter));

describe("categories", () => {
  let userSessionToken = "";
  let adminSessionToken = "";

  beforeAll(async () => {
    await $`bun drizzle-kit push --force`;

    const testUser = await createTestUser({
      email: "user@sample.com",
      password: "12345678",
      role: AuthRoles.USER,
      fullName: "Test User",
    });

    userSessionToken = testUser.session;

    const adminUser = await createTestUser({
      email: "admin@sample.com",
      password: "12345678",
      role: AuthRoles.ADMIN,
      fullName: "Test Admin",
    });

    adminSessionToken = adminUser.session;
  });

  afterAll(async () => {
    await $`bun run db:clear`;
  });

  describe("POST /categories", () => {
    it("should create a category successfully as a user", async () => {
      const response = await categoryClient.categories.$post(
        {
          json: {
            name: "Test user category",
            description: "Test user category description",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      if (response.status === 201) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category created successfully");
        expect(json.data).toHaveProperty("name", "test user category");
        expect(json.data).toHaveProperty(
          "description",
          "Test user category description",
        );
        expect(json.data).toHaveProperty("userId");
      }
    });

    it("should create a category successfully as an admin", async () => {
      const response = await categoryClient.categories.$post(
        {
          json: {
            name: "Test admin category",
            description: "Test admin category description",
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      if (response.status === 201) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category created successfully");
        expect(json.data).toHaveProperty("name", "test admin category");
        expect(json.data).toHaveProperty(
          "description",
          "Test admin category description",
        );
        expect(json.data.userId).toBeNull();
      }
    });

    it("should return 401 when user is not logged in", async () => {
      const response = await categoryClient.categories.$post({
        json: {
          name: "Test user category",
          description: "Test user category description",
        },
      });

      expect(response.status).toBe(401);

      if (response.status === 401) {
        const json = await response.json();

        expect(json.message).toBe("You are not authorized, please login");
      }
    });
  });
});

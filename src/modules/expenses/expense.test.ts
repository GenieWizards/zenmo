import { beforeAll, describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";

import { AuthRoles, SplitType } from "@/common/enums";
import { createApp } from "@/common/lib/create-app.lib";
import { AUTHORIZATION_ERROR_MESSAGE } from "@/common/utils/constants";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { createTestUser } from "@/common/utils/test.util";
import env from "@/env";

import { createCategoryRepository } from "../categories/category.repository";
import { expenseRouter } from "./expense.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const expenseClient = testClient(createApp().route("/", expenseRouter));

describe("expenses", () => {
  let testUser = {
    id: "",
    session: "",
  };

  let testUser2 = {
    id: "",
    session: "",
  };

  let adminUser = {
    id: "",
    session: "",
  };

  let testCategory = {
    id: "",
  };

  let testCategory2 = {
    id: "",
  };

  const expenseTestCommonFields = {
    amount: 100,
    currency: "USD",
    splitType: SplitType.EVEN,
    description: "expense description",
  };

  beforeAll(async () => {
    testUser = await createTestUser({
      email: "testUser@sample.com",
      password: "12345678",
      role: AuthRoles.USER,
      fullName: "Test User",
    });

    testUser2 = await createTestUser({
      email: "testUser2@sample.com",
      password: "12345678",
      role: AuthRoles.USER,
      fullName: "Test User",
    });

    adminUser = await createTestUser({
      email: "adminUser@sample.com",
      password: "12345678",
      role: AuthRoles.ADMIN,
      fullName: "Test Admin",
    });

    testCategory = await createCategoryRepository({ name: "Test category" });
    testCategory2 = await createCategoryRepository({ name: "Test category2" }, testUser2.id);
  });

  describe("POST /expenses", () => {
    it("should create an expense as user", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            categoryId: testCategory.id,
          },
        },
        {
          headers: {
            session: testUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.CREATED);
      if (response.status === HTTPStatusCodes.CREATED) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Expense created successfully");
        expect(json.data).toHaveProperty("amount", 100);
        expect(json.data).toHaveProperty("currency", "USD");
        expect(json.data).toHaveProperty("splitType", SplitType.EVEN);
        expect(json.data).toHaveProperty("categoryId", testCategory.id);
        expect(json.data).toHaveProperty("payerId", testUser.id);
      }
    });

    it("should create an expense as user with payerId", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            categoryId: testCategory.id,
            payerId: testUser2.id,
          },
        },
        {
          headers: {
            session: testUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.CREATED);
      if (response.status === HTTPStatusCodes.CREATED) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Expense created successfully");
        expect(json.data).toHaveProperty("amount", 100);
        expect(json.data).toHaveProperty("currency", "USD");
        expect(json.data).toHaveProperty("splitType", SplitType.EVEN);
        expect(json.data).toHaveProperty("categoryId", testCategory.id);
        expect(json.data).toHaveProperty("payerId", testUser2.id);
      }
    });

    it("should create an expense as admin", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            payerId: testUser.id,
            categoryId: testCategory.id,
          },
        },
        {
          headers: {
            session: adminUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.CREATED);
      if (response.status === HTTPStatusCodes.CREATED) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Expense created successfully");
        expect(json.data).toHaveProperty("amount", 100);
        expect(json.data).toHaveProperty("currency", "USD");
        expect(json.data).toHaveProperty("splitType", SplitType.EVEN);
        expect(json.data).toHaveProperty("creatorId", adminUser.id);
        expect(json.data).toHaveProperty("categoryId", testCategory.id);
        expect(json.data).toHaveProperty("payerId", testUser.id);
      }
    });

    it("should return 400 when admin creates expense without providing payer id", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
          },
        },
        {
          headers: {
            session: adminUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.BAD_REQUEST);
      if (response.status === HTTPStatusCodes.BAD_REQUEST) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Missing payerId");
      }
    });

    it("should return 404 when payer not found", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            payerId: "invalid payer id",
          },
        },
        {
          headers: {
            session: testUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.NOT_FOUND);
      if (response.status === HTTPStatusCodes.NOT_FOUND) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Payer not found");
      }
    });

    it("should return 404 when category not found", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            categoryId: "invalid category id",
          },
        },
        {
          headers: {
            session: testUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.NOT_FOUND);
      if (response.status === HTTPStatusCodes.NOT_FOUND) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category not found");
      }
    });

    it("should return 400 when category does not belongs to user", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            categoryId: testCategory2.id,
          },
        },
        {
          headers: {
            session: testUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.BAD_REQUEST);
      if (response.status === HTTPStatusCodes.BAD_REQUEST) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category does not belong to valid category user");
      }
    });

    it("should return 400 when category does not belongs to payer", async () => {
      const response = await expenseClient.expenses.$post(
        {
          json: {
            ...expenseTestCommonFields,
            payerId: testUser.id,
            categoryId: testCategory2.id,
          },
        },
        {
          headers: {
            session: adminUser.session,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.BAD_REQUEST);
      if (response.status === HTTPStatusCodes.BAD_REQUEST) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category does not belong to valid category user");
      }
    });

    it("should return 401 when user is not logged in", async () => {
      const response = await expenseClient.expenses.$post({
        json: {
          ...expenseTestCommonFields,
        },
      });

      if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(AUTHORIZATION_ERROR_MESSAGE);
      }
    });
  });
});

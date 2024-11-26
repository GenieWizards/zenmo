import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
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
        expect(json.data.isActive).toBeTrue();
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
        expect(json.data.isActive).toBeTrue();
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

        expect(json.success).toBe(false);
        expect(json.message).toBe("You are not authorized, please login");
      }
    });

    it("should return 409 when user trying to create a category with same name", async () => {
      await categoryClient.categories.$post(
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

      expect(response.status).toBe(409);

      if (response.status === 409) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category already exists");
      }
    });

    it("should return 409 when admin trying to create a category with same name", async () => {
      await categoryClient.categories.$post(
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

      expect(response.status).toBe(409);

      if (response.status === 409) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category already exists");
      }
    });
  });

  describe("GET /categories", () => {
    it("should get categories successfully as a user", async () => {
      const response = await categoryClient.categories.$get(
        {
          query: {},
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Categories retrieved successfully");
        expect(json.data).toBeArray();
        expect(json.metadata).toHaveProperty("page");
        expect(json.metadata).toHaveProperty("limit");
        expect(json.metadata).toHaveProperty("totalPages");
        expect(json.metadata).toHaveProperty("totalCount");
      }
    });

    it("should get categories successfully as an admin", async () => {
      const response = await categoryClient.categories.$get(
        {
          query: {},
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Categories retrieved successfully");
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.metadata).toHaveProperty("page");
        expect(json.metadata).toHaveProperty("limit");
        expect(json.metadata).toHaveProperty("totalPages");
        expect(json.metadata).toHaveProperty("totalCount");
      }
    });

    it("should handle pagination parameters correctly", async () => {
      const response = await categoryClient.categories.$get(
        {
          query: {
            page: 2,
            limit: 5,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.metadata.page).toBe(2);
        expect(json.metadata.limit).toBe(5);
      }
    });

    it("should handle search parameter correctly", async () => {
      const response = await categoryClient.categories.$get(
        {
          query: {
            search: "test",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(Array.isArray(json.data)).toBe(true);
        json.data.forEach((category) => {
          expect(category.name.toLowerCase()).toContain("test");
        });
      }
    });
  });

  describe("PATCH categories/:categoryId", () => {
    let userCategoryId: string;
    let adminCategoryId: string;

    beforeEach(async () => {
      // Create a category as user
      const userCategoryResponse = await categoryClient.categories.$post(
        {
          json: {
            name: "Test Update User Category",
            description: "Test User Category Description",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      if (userCategoryResponse.status === 201) {
        const userCategory = await userCategoryResponse.json();

        userCategoryId = userCategory.data.id;
      }

      // Create a category as admin
      const adminCategoryResponse = await categoryClient.categories.$post(
        {
          json: {
            name: "Test Update Admin Category",
            description: "Test Admin Category Description",
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      if (adminCategoryResponse.status === 201) {
        const adminCategory = await adminCategoryResponse.json();

        adminCategoryId = adminCategory.data.id;
      }
    });

    it("should update category successfully as owner", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            name: "Updated User Category",
            description: "Updated User Category Description",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.name).toBe("updated user category");
        expect(json.data.description).toBe("Updated User Category Description");
      }
    });

    it("should update any category successfully as admin", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId, // Admin updating user's category
          },
          json: {
            name: "Admin Updated User Category",
            description: "Admin Updated User Category Description",
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.name).toBe("admin updated user category");
        expect(json.data.description).toBe(
          "Admin Updated User Category Description",
        );
      }
    });

    it("should return 403 when non-owner user tries to update category", async () => {
      // Create another user session
      const anotherUserResponse = await createTestUser({
        email: "another@test.com",
        password: "password123",
        fullName: "Another Test User",
      });

      const anotherUserToken = anotherUserResponse.session;

      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            name: "Unauthorized Update",
          },
        },
        {
          headers: {
            session: anotherUserToken,
          },
        },
      );

      expect(response.status).toBe(403);

      if (response.status === 403) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "You are not authorized to update this category",
        );
      }
    });

    it("should return 404 when category does not exist", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: "non-existent-id",
          },
          json: {
            name: "Updated Category",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(404);

      if (response.status === 404) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("Category not found");
      }
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch({
        param: {
          categoryId: userCategoryId,
        },
        json: {
          name: "Unauthorized Update",
        },
      });

      expect(response.status).toBe(401);

      if (response.status === 401) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe("You are not authorized, please login");
      }
    });

    it("should allow admin to update their own category", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: adminCategoryId,
          },
          json: {
            name: "Updated Admin Category",
            description: "Updated Admin Category Description",
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.name).toBe("updated admin category");
        expect(json.data.description).toBe(
          "Updated Admin Category Description",
        );
      }
    });

    it("should not allow regular user to update admin's category", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: adminCategoryId,
          },
          json: {
            name: "User Trying to Update Admin Category",
            description: "This should fail",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(403);

      if (response.status === 403) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "You are not authorized to update this category",
        );
      }
    });

    it("should allow another admin to update admin's category", async () => {
      // Create another admin user
      const anotherAdminResponse = await createTestUser({
        email: "another-admin@test.com",
        password: "password123",
        fullName: "Another Admin User",
        role: AuthRoles.ADMIN,
      });
      const anotherAdminToken = anotherAdminResponse.session;

      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: adminCategoryId,
          },
          json: {
            name: "Another Admin Updated Category",
            description: "Updated by another admin",
          },
        },
        {
          headers: {
            session: anotherAdminToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.name).toBe("another admin updated category");
        expect(json.data.description).toBe("Updated by another admin");
      }
    });

    it("should allow user to set their category to inactive", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            isActive: false,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.isActive).toBe(false);
      }
    });

    it("should hide inactive categories from regular users in GET request", async () => {
      // First set a category to inactive
      await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            isActive: false,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      // Get categories as user
      const userResponse = await categoryClient.categories.$get(
        {
          query: {},
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(userResponse.status).toBe(200);

      if (userResponse.status === 200) {
        const json = await userResponse.json();

        expect(json.success).toBe(true);
        expect(json.data).toBeArray();
        // Verify that inactive category is not in the response
        const inactiveCategory = json.data.find(
          (cat: any) => cat.id === userCategoryId,
        );
        expect(inactiveCategory).toBeUndefined();
      }
    });

    it("should show inactive categories to admin in GET request", async () => {
      // First set a category to inactive
      await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            isActive: false,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      // Get categories as admin
      const adminResponse = await categoryClient.categories.$get(
        {
          query: {},
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(adminResponse.status).toBe(200);

      if (adminResponse.status === 200) {
        const json = await adminResponse.json();

        expect(json.success).toBe(true);
        expect(json.data).toBeArray();
        // Verify that inactive category is in the response
        const inactiveCategory = json.data.find(
          (cat: any) => cat.id === userCategoryId,
        );
        expect(inactiveCategory).toBeDefined();
        expect(inactiveCategory?.isActive).toBe(false);
      }
    });

    it("should allow admin to set any category to inactive", async () => {
      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId, // Admin updating user's category
          },
          json: {
            isActive: false,
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe("Category updated successfully");
        expect(json.data.isActive).toBe(false);
      }
    });

    it("should not allow non-owner user to set category status", async () => {
      // Create another user
      const anotherUserResponse = await createTestUser({
        email: "another-user@test.com",
        password: "password123",
        fullName: "Another Test User",
      });
      const anotherUserToken = anotherUserResponse.session;

      const response = await categoryClient.categories[":categoryId"].$patch(
        {
          param: {
            categoryId: userCategoryId,
          },
          json: {
            isActive: false,
          },
        },
        {
          headers: {
            session: anotherUserToken,
          },
        },
      );

      expect(response.status).toBe(403);

      if (response.status === 403) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "You are not authorized to update this category",
        );
      }
    });
  });

  describe("DELETE /categories/:categoryId", () => {
    let userCategoryId: string;
    let adminCategoryId: string;

    beforeEach(async () => {
      // Create a category as user
      const userCategoryResponse = await categoryClient.categories.$post(
        {
          json: {
            name: "Test Delete User Category",
            description: "Test User Category Description",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      if (userCategoryResponse.status === 201) {
        const userCategory = await userCategoryResponse.json();
        userCategoryId = userCategory.data.id;
      }

      // Create a category as admin
      const adminCategoryResponse = await categoryClient.categories.$post(
        {
          json: {
            name: "Test Delete Admin Category",
            description: "Test Admin Category Description",
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      if (adminCategoryResponse.status === 201) {
        const adminCategory = await adminCategoryResponse.json();
        adminCategoryId = adminCategory.data.id;
      }
    });

    it("should delete category successfully as owner", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: userCategoryId,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.message).toBe("Category deleted successfully");
      }
    });

    it("should delete any category successfully as admin", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: userCategoryId, // Admin deleting user's category
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.message).toBe("Category deleted successfully");
      }
    });

    it("should return 403 when non-owner user tries to delete category", async () => {
      // Create another user session
      const anotherUserResponse = await createTestUser({
        email: "another-delete@test.com",
        password: "password123",
        fullName: "Another Test User",
      });

      const anotherUserToken = anotherUserResponse.session;

      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: userCategoryId,
          },
        },
        {
          headers: {
            session: anotherUserToken,
          },
        },
      );

      expect(response.status).toBe(403);

      if (response.status === 403) {
        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "You are not authorized to delete this category",
        );
      }
    });

    it("should return 404 when category does not exist", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: "non-existent-id",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(404);

      if (response.status === 404) {
        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.message).toBe("Category not found");
      }
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete({
        param: {
          categoryId: userCategoryId,
        },
      });

      expect(response.status).toBe(401);

      if (response.status === 401) {
        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.message).toBe("You are not authorized, please login");
      }
    });

    it("should allow admin to delete their own category", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: adminCategoryId,
          },
        },
        {
          headers: {
            session: adminSessionToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.message).toBe("Category deleted successfully");
      }
    });

    it("should not allow regular user to delete admin-created category", async () => {
      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: adminCategoryId,
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(403);

      if (response.status === 403) {
        const json = await response.json();
        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "You are not authorized to delete this category",
        );
      }
    });

    it("should allow another admin to delete admin-created category", async () => {
      // Create another admin user
      const anotherAdminResponse = await createTestUser({
        email: "another-admin-delete@test.com",
        password: "password123",
        fullName: "Another Admin User",
        role: AuthRoles.ADMIN,
      });

      const anotherAdminToken = anotherAdminResponse.session;

      const response = await categoryClient.categories[":categoryId"].$delete(
        {
          param: {
            categoryId: adminCategoryId,
          },
        },
        {
          headers: {
            session: anotherAdminToken,
          },
        },
      );

      expect(response.status).toBe(200);

      if (response.status === 200) {
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.message).toBe("Category deleted successfully");
      }
    });
  });
});

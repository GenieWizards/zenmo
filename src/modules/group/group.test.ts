import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";

import { createApp } from "@/common/lib/create-app.lib";
import { AUTHORIZATION_ERROR_MESSAGE } from "@/common/utils/constants";
import * as HTTPStatusCodes from "@/common/utils/http-status-codes.util";
import { createTestUser } from "@/common/utils/test.util";
import env from "@/env";

import { groupRouters } from "./group.index";
import {
  getGroupMembersByIdRepository,
} from "./group.repository";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const groupClient = testClient(createApp().route("/", groupRouters));

describe("group Handler", () => {
  let userSessionToken = "";
  // let adminSessionToken = "";
  let testUsers: Array<{ id: string; username: string }> = [];

  beforeAll(async () => {
    // Create test users
    const testUser = await createTestUser({
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
    });
    userSessionToken = testUser.session;

    // const adminUser = await createTestUser({
    //   email: "admin@example.com",
    //   password: "password123",
    //   fullName: "Admin User",
    //   role: AuthRoles.ADMIN,
    // });
    // adminSessionToken = adminUser.session;

    // Create additional test users to be added to group
    const user1 = await createTestUser({
      email: "user1@example.com",
      password: "password123",
      fullName: "User One",
    });
    const user2 = await createTestUser({
      email: "user2@example.com",
      password: "password123",
      fullName: "User Two",
    });

    const user3 = await createTestUser({
      email: "user3@example.com",
      password: "password123",
      fullName: "User Three",
    });

    testUsers = [
      { id: user1.id, username: user1.fullName || "" },
      { id: user2.id, username: user2.fullName || "" },
      { id: user3.id, username: user3.fullName || "" },
    ];
  });

  describe("POST /groups/:groupId/users", () => {
    let groupId = "";

    beforeEach(async () => {
      // Create a fresh group before each test
      const response = await groupClient.groups.$post(
        {
          json: {
            name: "Test Group",
          },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      if (response.ok) {
        const json = await response.json();
        groupId = json.data.id;
      }
    });

    it("should successfully add users to a group", async () => {
      const response = await groupClient.groups[":groupId"].users.$post(
        {
          json: testUsers.map(user => ({
            userId: user.id,
            username: user.username,
          })),
          param: { groupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.OK);

      if (response.status === HTTPStatusCodes.OK) {
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.message).toBe("Users added to group successfully");

        // Verify users were actually added to the group
        const groupMembers = await getGroupMembersByIdRepository(groupId);

        expect(groupMembers).toHaveLength(testUsers.length + 1); // +1 to include creator also
        expect(groupMembers.map(m => m.userId)).toEqual(
          expect.arrayContaining(testUsers.map(u => u.id)),
        );
      }
    });

    it("should fail when trying to add non-existent users", async () => {
      const response = await groupClient.groups[":groupId"].users.$post(
        {
          json: [
            {
              userId: "non-existent-uuid",
              username: "non existent",
            },
          ],
          param: { groupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      const json = await response.json();
      expect(json.success).toBe(false);
    });

    it("should fail when group does not exist with invalid id validation", async () => {
      const invalidGroupId = "invalid-group-id";

      const response = await groupClient.groups[":groupId"].users.$post(
        {
          json: testUsers.map(user => ({
            userId: user.id,
            username: user.username,
          })),
          param: { groupId: invalidGroupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("should fail when group does not exist with valid id validation", async () => {
      const invalidGroupId = "non-existent-uuid-but-it-is-a-valid-length-id";
      const response = await groupClient.groups[":groupId"].users.$post(
        {
          json: testUsers.map(user => ({
            userId: user.id,
            username: user.username,
          })),
          param: { groupId: invalidGroupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.NOT_FOUND);

      if (response.status === HTTPStatusCodes.NOT_FOUND) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toContain(
          `Group with ${invalidGroupId} not found`,
        );
      }
    });

    it("should fail when user is not authenticated", async () => {
      const response = await groupClient.groups[":groupId"].users.$post({
        json: testUsers.map(user => ({
          userId: user.id,
          username: user.username,
        })),
        param: { groupId },
      });

      expect(response.status).toBe(HTTPStatusCodes.UNAUTHORIZED);

      if (response.status === HTTPStatusCodes.UNAUTHORIZED) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(AUTHORIZATION_ERROR_MESSAGE);
      }
    });

    it("should return 409 when adding user that already exists in group", async () => {
      await groupClient.groups[":groupId"].users.$post(
        {
          json: testUsers.map(user => ({
            userId: user.id,
            username: user.username,
          })),
          param: { groupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      const response = await groupClient.groups[":groupId"].users.$post(
        {
          json: testUsers.map(user => ({
            userId: user.id,
            username: user.username,
          })),
          param: { groupId },
        },
        {
          headers: {
            session: userSessionToken,
          },
        },
      );

      expect(response.status).toBe(HTTPStatusCodes.CONFLICT);

      if (response.status === HTTPStatusCodes.CONFLICT) {
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.message).toBe(
          "Some or all of the users you are trying to add already exist in the group",
        );
      }
    });
  });
});

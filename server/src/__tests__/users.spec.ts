import { User } from "../entities/User";
import request from "supertest";
import app from "../app";
import { createTestUser, generateAuthToken, clearDatabase } from "./helpers";

describe("Users", () => {
  let testUser: User;
  let authToken: string;

  beforeEach(async () => {
    await clearDatabase();
    testUser = await createTestUser();
    authToken = generateAuthToken(testUser);

    // Create some test users for search
    await Promise.all([
      createTestUser("john.doe@example.com"),
      createTestUser("jane.doe@example.com"),
      createTestUser("bob.smith@example.com"),
    ]);
  });

  describe("GET /api/users/search", () => {
    it("should search users by name or email", async () => {
      const response = await request(app)
        .get("/api/users/search?query=doe")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("email");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("avatarUrl");
    });

    it("should require minimum query length", async () => {
      const response = await request(app)
        .get("/api/users/search?query=a")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain(
        "at least 2 characters"
      );
    });

    it("should require query parameter", async () => {
      const response = await request(app)
        .get("/api/users/search")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toBe("Invalid value");
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/users/search?query=doe");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get user profile", async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        avatarUrl: testUser.avatarUrl,
      });
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/api/users/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should validate user ID format", async () => {
      const response = await request(app)
        .get("/api/users/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe("id");
    });

    it("should require authentication", async () => {
      const response = await request(app).get(`/api/users/${testUser.id}`);

      expect(response.status).toBe(401);
    });
  });
});

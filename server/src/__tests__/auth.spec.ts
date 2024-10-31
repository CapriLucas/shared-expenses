import { User } from "../entities/User";
import { OAuth2Client } from "google-auth-library";
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import { clearDatabase } from "./helpers";
import { getDataSource } from "../database/context";

jest.mock("google-auth-library");

describe("Authentication", () => {
  let userRepository: any;

  beforeEach(async () => {
    userRepository = getDataSource().getRepository(User);
    await clearDatabase();
    jest.clearAllMocks();
  });

  describe("POST /auth/google", () => {
    const mockGoogleToken = "mock-google-token";
    const mockGooglePayload = {
      sub: "123",
      email: "test@example.com",
      name: "Test User",
      picture: "https://example.com/picture.jpg",
    };

    beforeEach(() => {
      (OAuth2Client.prototype.verifyIdToken as jest.Mock).mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });
    });

    it("should create a new user when authenticating for the first time", async () => {
      const response = await request(app)
        .post("/auth/google")
        .send({ token: mockGoogleToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        email: mockGooglePayload.email,
        name: mockGooglePayload.name,
        googleId: mockGooglePayload.sub,
        avatarUrl: mockGooglePayload.picture,
      });

      const user = await userRepository.findOneBy({
        googleId: mockGooglePayload.sub,
      });
      expect(user).toBeTruthy();
    });

    it("should return existing user when authenticating again", async () => {
      const existingUser = userRepository.create({
        email: mockGooglePayload.email,
        name: mockGooglePayload.name,
        googleId: mockGooglePayload.sub,
        avatarUrl: mockGooglePayload.picture,
      });
      await userRepository.save(existingUser);

      const response = await request(app)
        .post("/auth/google")
        .send({ token: mockGoogleToken });

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(existingUser.id);
    });

    it("should return valid JWT token", async () => {
      const response = await request(app)
        .post("/auth/google")
        .send({ token: mockGoogleToken });

      const decodedToken = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET!
      ) as { userId: number };
      expect(decodedToken).toHaveProperty("userId");

      const user = await userRepository.findOneBy({ id: decodedToken.userId });
      expect(user).toBeTruthy();
    });

    it("should handle invalid Google token", async () => {
      (OAuth2Client.prototype.verifyIdToken as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      const response = await request(app)
        .post("/auth/google")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });
});

import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { getDataSource } from "../database/context";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    const userRepository = getDataSource().getRepository(User);
    let user = await userRepository.findOneBy({ googleId: payload.sub });

    if (!user) {
      // Create new user if they don't exist
      user = new User();
      user.email = payload.email!;
      user.name = payload.name!;
      user.googleId = payload.sub;
      user.avatarUrl = payload.picture!;
      await userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      user,
      token: accessToken,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

export default router;

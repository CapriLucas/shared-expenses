import { Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AuthRequest } from "../middleware/auth";

const userRepository = AppDataSource.getRepository(User);

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await userRepository
      .createQueryBuilder("user")
      .where("user.email ILIKE :query OR user.name ILIKE :query", {
        query: `%${query}%`,
      })
      .select(["user.id", "user.email", "user.name", "user.avatarUrl"])
      .limit(10)
      .getMany();

    return res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ error: "Failed to search users" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: ["id", "email", "name", "avatarUrl"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

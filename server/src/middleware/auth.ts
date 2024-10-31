import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { getDataSource } from "../database/context";

export interface AuthRequest extends Request {
  user?: User;
  file?: Express.Multer.File;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const userRepository = getDataSource().getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.userId });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication required" });
  }
};

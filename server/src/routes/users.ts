import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { searchUsers, getUserProfile } from "../controllers/userController";
import { validate } from "../middleware/validate";
import {
  searchUsersValidator,
  userIdValidator,
} from "../validators/user.validator";

const router = Router();

// Apply auth middleware to all user routes
router.use(authMiddleware);

// User routes
router.get("/search", validate(searchUsersValidator), searchUsers);
router.get("/:id", validate(userIdValidator), getUserProfile);

export default router;

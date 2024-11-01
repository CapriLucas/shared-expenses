import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/settingsController";
import { validate } from "../middleware/validate";
import { updateSettingsValidator } from "../validators/settings.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserSettings);
router.patch("/", validate(updateSettingsValidator), updateUserSettings);

export default router;

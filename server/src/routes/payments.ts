import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../config/multer";
import {
  createPayment,
  getPayments,
  getPaymentById,
  verifyPayment,
} from "../controllers/paymentController";
import { validate } from "../middleware/validate";
import {
  createPaymentValidator,
  paymentIdValidator,
  verifyPaymentValidator,
} from "../validators/payment.validator";

const router = Router();

// Apply auth middleware to all payment routes
router.use(authMiddleware);

// Payment routes
router.post(
  "/",
  upload.single("receipt"),
  validate(createPaymentValidator),
  createPayment
);
router.get("/", getPayments);
router.get("/:id", validate(paymentIdValidator), getPaymentById);
router.patch("/:id/verify", validate(verifyPaymentValidator), verifyPayment);

export default router;

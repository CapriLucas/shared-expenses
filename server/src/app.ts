import express from "express";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import paymentRoutes from "./routes/payments";
import { setupSwagger } from "./swagger";
import { errorHandler } from "./middleware/error";

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  `/${process.env.UPLOAD_DIR}`,
  express.static(path.join(__dirname, `../${process.env.UPLOAD_DIR}`))
);

// Setup Swagger
setupSwagger(app);

// Routes
app.use("/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);

// Error handling
app.use(errorHandler);

export default app;

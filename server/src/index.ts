import { AppDataSource } from "./data-source";
import healthRoutes from "./routes/health";
import app from "./app";
import { initializeCronJobs } from "./services/cron";

const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();

    // Synchronize database schema
    await AppDataSource.synchronize();

    console.log("Database connected and synchronized");

    // Add health routes first
    app.use(healthRoutes);

    // Initialize cron jobs
    initializeCronJobs();
    console.log("Cron jobs initialized");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

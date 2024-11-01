import { Request, Response } from "express";
import { getDataSource } from "../database/context";

export const checkHealth = async (_req: Request, res: Response) => {
  try {
    // Check database connection
    const isDbConnected = getDataSource().isInitialized;

    // Check Google Cloud Storage connection
    const isStorageConfigured = Boolean(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
        process.env.GOOGLE_CLOUD_CLIENT_EMAIL &&
        process.env.GOOGLE_CLOUD_PRIVATE_KEY &&
        process.env.GOOGLE_CLOUD_BUCKET_NAME
    );

    const status = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: isDbConnected ? "connected" : "disconnected",
        storage: isStorageConfigured ? "configured" : "not configured",
      },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
    };

    const httpStatus = isDbConnected && isStorageConfigured ? 200 : 503;
    res.status(httpStatus).json(status);
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Service unavailable",
    });
  }
};

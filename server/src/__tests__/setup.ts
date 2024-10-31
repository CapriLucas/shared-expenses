import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";
import { getTestDataSource } from "../data-source.test";
import { setDataSource } from "../database/context";
import "./mocks/googleCloud";

let dataSource: DataSource;

beforeAll(async () => {
  try {
    // Load test environment variables
    config({ path: path.join(__dirname, "../../.env.test") });

    // Set test environment variables
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.GOOGLE_CLOUD_BUCKET_NAME = "test-bucket";

    // Initialize and set test database
    dataSource = await getTestDataSource();
    setDataSource(dataSource);
  } catch (error) {
    console.error("Test setup error:", error);
    throw error;
  }
});

afterAll(async () => {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Add global error handler for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

import { AppDataSource } from "./data-source";
import app from "./app";

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );

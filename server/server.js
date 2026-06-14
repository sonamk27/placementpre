import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase, retryDatabaseConnection } from "./config/database.js";

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(
      "MongoDB is not connected yet. API will stay online and retry in the background.",
    );
    console.warn(error.message);
  }

  app.listen(config.port, () => {
    console.log(`PrepMate API running on http://127.0.0.1:${config.port}`);
  });

  retryDatabaseConnection();
};

startServer();

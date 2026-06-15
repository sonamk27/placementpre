import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase, retryDatabaseConnection } from "./config/database.js";

const startDatabaseConnection = async () => {
  try {
    await connectDatabase({ serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(
      "MongoDB is not connected yet. API will stay online and retry in the background.",
    );
    console.warn(error.message);
  }

  retryDatabaseConnection();
};

const startServer = () => {
  const server = app.listen(config.port, () => {
    console.log(`PrepMate API running on http://127.0.0.1:${config.port}`);
  });

  server.on("error", (error) => {
    console.error("Failed to start PrepMate API", error.message);
    process.exit(1);
  });

  startDatabaseConnection();
};

startServer();

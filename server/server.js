import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`PrepMate API running on http://127.0.0.1:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start PrepMate API", error);
    process.exit(1);
  }
};

startServer();

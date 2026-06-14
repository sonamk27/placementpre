import mongoose from "mongoose";
import { config } from "./env.js";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const connectDatabase = async (options = {}) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 5000,
  });

  return mongoose.connection;
};

export const retryDatabaseConnection = (intervalMs = 10000) => {
  setInterval(async () => {
    if (mongoose.connection.readyState !== 0) {
      return;
    }

    try {
      await connectDatabase({ serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected");
    } catch {
      // Keep the API online; DB-backed routes return a clear 503 until MongoDB is reachable.
    }
  }, intervalMs).unref();
};

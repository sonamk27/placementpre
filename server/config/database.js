import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
};

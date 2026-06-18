import dotenv from "dotenv";
import {
  DEFAULT_COMMUNICATION_MODEL,
  DEFAULT_TRANSCRIPTION_MODEL,
  buildModelRegistry,
} from "./aiModels.js";

dotenv.config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const parseOrigins = (value) =>
  (value || "http://127.0.0.1:5173,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const modelRegistry = buildModelRegistry({
  communicationDefault: process.env.OPENAI_MODEL || DEFAULT_COMMUNICATION_MODEL,
  transcriptionDefault:
    process.env.OPENAI_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL,
  extraCommunicationModels: process.env.OPENAI_COMMUNICATION_MODELS,
  extraTranscriptionModels: process.env.OPENAI_TRANSCRIPTION_MODELS,
});

if (isProduction) {
  const missing = ["MONGODB_URI", "JWT_SECRET", "OPENAI_API_KEY"].filter(
    (key) => !process.env[key],
  );

  if (missing.length) {
    throw new Error(`Missing required production env vars: ${missing.join(", ")}`);
  }
}

export const config = {
  env: nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/prepmate_ai",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  guestUserId: process.env.GUEST_USER_ID || "000000000000000000000001",
  corsOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: modelRegistry.communicationDefault,
    transcriptionModel: modelRegistry.transcriptionDefault,
    communicationModels: modelRegistry.communicationModels,
    transcriptionModels: modelRegistry.transcriptionModels,
  },
  allowAiFallback:
    process.env.ALLOW_AI_FALLBACK === "true" ||
    (!process.env.OPENAI_API_KEY && !isProduction),
};

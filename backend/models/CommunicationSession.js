import mongoose from "mongoose";
import { DEFAULT_COMMUNICATION_MODEL } from "../config/aiModels.js";

const score = {
  type: Number,
  required: true,
  min: 1,
  max: 10,
};

const communicationSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    correctedMessage: {
      type: String,
      required: true,
      trim: true,
    },
    grammarScore: score,
    vocabularyScore: score,
    fluencyScore: score,
    confidenceScore: score,
    aiFeedback: {
      type: String,
      required: true,
      trim: true,
    },
    mistakes: {
      type: [String],
      default: [],
    },
    betterVocabularySuggestions: {
      type: [String],
      default: [],
    },
    improvementTip: {
      type: String,
      default: "",
      trim: true,
    },
    aiRecommendations: {
      type: [String],
      default: [],
    },
    motivationQuote: {
      type: String,
      required: true,
      trim: true,
    },
    followUpQuestion: {
      type: String,
      required: true,
      trim: true,
    },
    aiModel: {
      type: String,
      default: DEFAULT_COMMUNICATION_MODEL,
      trim: true,
      maxlength: 80,
    },
    aiProvider: {
      type: String,
      default: "openai",
      trim: true,
      maxlength: 40,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

communicationSessionSchema.index({ userId: 1, createdAt: -1 });

export const CommunicationSession = mongoose.model(
  "CommunicationSession",
  communicationSessionSchema,
);

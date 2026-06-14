import mongoose from "mongoose";

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

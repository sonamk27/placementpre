import mongoose from "mongoose";

const averageScore = {
  type: Number,
  default: 0,
  min: 0,
  max: 10,
};

const dailyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalConversations: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageGrammarScore: averageScore,
    averageVocabularyScore: averageScore,
    averageFluencyScore: averageScore,
    averageConfidenceScore: averageScore,
  },
  { timestamps: true },
);

dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyProgress = mongoose.model("DailyProgress", dailyProgressSchema);

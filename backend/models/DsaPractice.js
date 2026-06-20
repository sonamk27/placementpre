import mongoose from "mongoose";

const dsaPracticeSchema = new mongoose.Schema(
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
    questionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

dsaPracticeSchema.index({ userId: 1, date: 1 }, { unique: true });
dsaPracticeSchema.index({ userId: 1, completed: 1, date: -1 });

export const DsaPractice = mongoose.model("DsaPractice", dsaPracticeSchema);

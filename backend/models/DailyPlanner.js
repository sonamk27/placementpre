import mongoose from "mongoose";

const plannerItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    estimate: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "25 min",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const dailyPlannerSchema = new mongoose.Schema(
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
    goals: {
      type: [plannerItemSchema],
      default: [],
    },
    tasks: {
      type: [plannerItemSchema],
      default: [],
    },
    suggestion: {
      type: String,
      trim: true,
      maxlength: 360,
      default: "",
    },
  },
  { timestamps: true },
);

dailyPlannerSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlanner = mongoose.model("DailyPlanner", dailyPlannerSchema);

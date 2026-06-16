import { DailyPlanner } from "../models/DailyPlanner.js";
import { dateKey, startOfUtcDay } from "./dailyGeneratorService.js";

export const defaultPlannerGoals = [
  { title: "Solve 3 DSA Questions", priority: "High", estimate: "75 min" },
  { title: "Practice SQL for 30 Minutes", priority: "Medium", estimate: "30 min" },
  { title: "Communication Practice", priority: "High", estimate: "20 min" },
  { title: "Apply for Jobs", priority: "Medium", estimate: "25 min" },
  { title: "Project Development", priority: "Low", estimate: "60 min" },
];

export const defaultPlannerTasks = [
  { title: "Revise sliding window", priority: "High", estimate: "45 min" },
  { title: "Build SQL joins notes", priority: "Medium", estimate: "30 min" },
  { title: "Record intro answer", priority: "High", estimate: "15 min" },
];

export const defaultPlannerSuggestion =
  "Rearrange tasks by interview impact, finish DSA before lower-priority applications, and reserve 20 minutes for reflection.";

const serializeItem = (item, index, prefix) => ({
  id: item._id?.toString?.() || `${prefix}-${index}`,
  title: item.title,
  priority: item.priority,
  estimate: item.estimate,
  completed: Boolean(item.completed),
});

export const buildDefaultPlannerPayload = (date = new Date()) => ({
  date: dateKey(date),
  goals: defaultPlannerGoals.map((item, index) =>
    serializeItem({ ...item, completed: false }, index, "goal"),
  ),
  tasks: defaultPlannerTasks.map((item, index) =>
    serializeItem({ ...item, completed: false }, index, "task"),
  ),
  suggestion: defaultPlannerSuggestion,
  saved: false,
});

export const serializePlanner = (planner, saved = true) => ({
  id: planner._id?.toString?.(),
  date: dateKey(planner.date),
  goals: planner.goals.map((item, index) => serializeItem(item, index, "goal")),
  tasks: planner.tasks.map((item, index) => serializeItem(item, index, "task")),
  suggestion: planner.suggestion || defaultPlannerSuggestion,
  saved,
});

export const getOrCreatePlanner = async (userId, date = new Date()) => {
  const dayStart = startOfUtcDay(date);

  const planner = await DailyPlanner.findOneAndUpdate(
    { userId, date: dayStart },
    {
      $setOnInsert: {
        userId,
        date: dayStart,
        goals: defaultPlannerGoals,
        tasks: defaultPlannerTasks,
        suggestion: defaultPlannerSuggestion,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return planner;
};

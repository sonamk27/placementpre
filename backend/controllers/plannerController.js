import { Types } from "mongoose";
import { isDatabaseConnected } from "../config/database.js";
import {
  buildDefaultPlannerPayload,
  getOrCreatePlanner,
  serializePlanner,
} from "../services/dailyPlannerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

const getUserId = (req) => new Types.ObjectId(req.user._id);

const getPlannerForRequest = async (req) => getOrCreatePlanner(getUserId(req));

const findPlannerItem = (items, itemId, resourceName) => {
  const item = items.id(itemId);

  if (!item) {
    throw new HttpError(404, `${resourceName} not found`);
  }

  return item;
};

export const getTodayPlanner = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(buildDefaultPlannerPayload());
  }

  const planner = await getPlannerForRequest(req);
  return res.json(serializePlanner(planner));
});

export const addPlannerTask = asyncHandler(async (req, res) => {
  const planner = await getPlannerForRequest(req);

  planner.tasks.push({
    title: req.body.title,
    priority: req.body.priority || "Medium",
    estimate: req.body.estimate || "25 min",
    completed: Boolean(req.body.completed),
  });

  await planner.save();
  return res.status(201).json(serializePlanner(planner));
});

export const updatePlannerTask = asyncHandler(async (req, res) => {
  const planner = await getPlannerForRequest(req);
  const task = findPlannerItem(planner.tasks, req.params.taskId, "Task");

  for (const field of ["title", "priority", "estimate", "completed"]) {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  }

  await planner.save();
  return res.json(serializePlanner(planner));
});

export const deletePlannerTask = asyncHandler(async (req, res) => {
  const planner = await getPlannerForRequest(req);
  const task = findPlannerItem(planner.tasks, req.params.taskId, "Task");

  task.deleteOne();
  await planner.save();

  return res.json(serializePlanner(planner));
});

export const updatePlannerGoal = asyncHandler(async (req, res) => {
  const planner = await getPlannerForRequest(req);
  const goal = findPlannerItem(planner.goals, req.params.goalId, "Goal");

  if (req.body.completed !== undefined) {
    goal.completed = req.body.completed;
  }

  await planner.save();
  return res.json(serializePlanner(planner));
});

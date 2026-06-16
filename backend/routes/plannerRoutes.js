import { Router } from "express";
import {
  addPlannerTask,
  deletePlannerTask,
  getTodayPlanner,
  updatePlannerGoal,
  updatePlannerTask,
} from "../controllers/plannerController.js";
import { attachCommunicationUser } from "../middleware/authMiddleware.js";
import { requireDatabase } from "../middleware/databaseMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createTaskValidator,
  taskIdValidator,
  updateGoalValidator,
  updateTaskValidator,
} from "../validators/plannerValidators.js";

const router = Router();

router.use(attachCommunicationUser);

router.get("/today", getTodayPlanner);
router.use(requireDatabase);
router.post("/tasks", createTaskValidator, validateRequest, addPlannerTask);
router.patch("/tasks/:taskId", updateTaskValidator, validateRequest, updatePlannerTask);
router.delete("/tasks/:taskId", taskIdValidator, validateRequest, deletePlannerTask);
router.patch("/goals/:goalId", updateGoalValidator, validateRequest, updatePlannerGoal);

export default router;

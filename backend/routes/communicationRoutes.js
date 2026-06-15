import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  analyzeMessage,
  exportHistory,
  getHistory,
  getMonthlySummaryController,
  getStats,
  getWeeklyReportController,
  startTopic,
  transcribeAnswerAudio,
} from "../controllers/communicationController.js";
import { attachCommunicationUser } from "../middleware/authMiddleware.js";
import { requireDatabase } from "../middleware/databaseMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  analyzeValidator,
  exportValidator,
  historyValidator,
} from "../validators/communicationValidators.js";

const router = Router();

const coachLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.use(attachCommunicationUser);

router.post("/start-topic", coachLimiter, startTopic);
router.post(
  "/analyze",
  coachLimiter,
  analyzeValidator,
  validateRequest,
  analyzeMessage,
);
router.post(
  "/transcribe",
  coachLimiter,
  express.raw({ type: ["audio/*", "application/octet-stream"], limit: "12mb" }),
  transcribeAnswerAudio,
);
router.get("/history", historyValidator, validateRequest, getHistory);
router.get("/stats", getStats);
router.use(requireDatabase);
router.get("/report/weekly", getWeeklyReportController);
router.get("/summary/monthly", getMonthlySummaryController);
router.get("/export", exportValidator, validateRequest, exportHistory);

export default router;

import { Types } from "mongoose";
import { CommunicationSession } from "../models/CommunicationSession.js";
import {
  getCommunicationStats,
  getMonthlyPerformanceSummary,
  getWeeklyReport,
  toHistoryCsv,
  updateDailyProgressForSession,
} from "../services/communicationAnalyticsService.js";
import { getDailyCommunicationStarter } from "../services/dailyGeneratorService.js";
import { analyzeWithCommunicationCoach } from "../services/openaiCommunicationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const mapSession = (session) => ({
  id: session._id,
  topic: session.topic,
  originalMessage: session.userMessage,
  correctedMessage: session.correctedMessage,
  grammarScore: session.grammarScore,
  vocabularyScore: session.vocabularyScore,
  fluencyScore: session.fluencyScore,
  confidenceScore: session.confidenceScore,
  feedback: session.aiFeedback,
  recommendations: session.aiRecommendations,
  followUpQuestion: session.followUpQuestion,
  motivationQuote: session.motivationQuote,
  createdAt: session.createdAt,
});

export const startTopic = asyncHandler(async (req, res) => {
  res.json(getDailyCommunicationStarter(req.user._id));
});

export const analyzeMessage = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  const starter = getDailyCommunicationStarter(req.user._id);
  const topic = req.body.topic || starter.topic;
  const analysis = await analyzeWithCommunicationCoach({
    message: req.body.message,
    topic,
  });

  const session = await CommunicationSession.create({
    userId,
    topic,
    userMessage: req.body.message,
    correctedMessage: analysis.correctedMessage,
    grammarScore: analysis.grammarScore,
    vocabularyScore: analysis.vocabularyScore,
    fluencyScore: analysis.fluencyScore,
    confidenceScore: analysis.confidenceScore,
    aiFeedback: analysis.feedback,
    aiRecommendations: analysis.recommendations,
    followUpQuestion: analysis.followUpQuestion,
    motivationQuote: analysis.motivationQuote || starter.motivationQuote,
  });

  await updateDailyProgressForSession(userId, session.createdAt);

  res.status(201).json({
    originalMessage: session.userMessage,
    correctedMessage: session.correctedMessage,
    grammarScore: session.grammarScore,
    vocabularyScore: session.vocabularyScore,
    fluencyScore: session.fluencyScore,
    confidenceScore: session.confidenceScore,
    feedback: session.aiFeedback,
    recommendations: session.aiRecommendations,
    followUpQuestion: session.followUpQuestion,
    motivationQuote: session.motivationQuote,
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;
  const userId = new Types.ObjectId(req.user._id);

  const [items, total] = await Promise.all([
    CommunicationSession.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommunicationSession.countDocuments({ userId }),
  ]);

  res.json({
    conversations: items.map(mapSession),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  res.json(await getCommunicationStats(userId));
});

export const getWeeklyReportController = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  res.json(await getWeeklyReport(userId));
});

export const getMonthlySummaryController = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  res.json(await getMonthlyPerformanceSummary(userId));
});

export const exportHistory = asyncHandler(async (req, res) => {
  const userId = new Types.ObjectId(req.user._id);
  const sessions = await CommunicationSession.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  if (req.query.format === "csv") {
    res.header("Content-Type", "text/csv");
    res.attachment("communication-history.csv");
    return res.send(toHistoryCsv(sessions));
  }

  return res.json({
    conversations: sessions.map(mapSession),
  });
});

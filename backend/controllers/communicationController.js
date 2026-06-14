import { Types } from "mongoose";
import { isDatabaseConnected } from "../config/database.js";
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
  mistakes: session.mistakes || [],
  betterVocabularySuggestions: session.betterVocabularySuggestions || [],
  improvementTip: session.improvementTip || "",
  recommendations: session.aiRecommendations,
  followUpQuestion: session.followUpQuestion,
  motivationQuote: session.motivationQuote,
  createdAt: session.createdAt,
});

const emptyWeeklyProgress = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));

    return {
      date: date.toISOString().slice(0, 10),
      totalConversations: 0,
      averageGrammarScore: 0,
      averageVocabularyScore: 0,
      averageFluencyScore: 0,
      averageConfidenceScore: 0,
    };
  });

const emptyStats = () => {
  const weeklyProgress = emptyWeeklyProgress();

  return {
    totalConversations: 0,
    averageGrammarScore: 0,
    averageVocabularyScore: 0,
    averageFluencyScore: 0,
    averageConfidenceScore: 0,
    weeklyProgress,
    weeklyImprovementPercentage: 0,
    conversationStreak: 0,
    charts: {
      grammar: weeklyProgress.map((row) => ({ date: row.date, score: 0 })),
      vocabulary: weeklyProgress.map((row) => ({ date: row.date, score: 0 })),
      fluency: weeklyProgress.map((row) => ({ date: row.date, score: 0 })),
      confidence: weeklyProgress.map((row) => ({ date: row.date, score: 0 })),
    },
  };
};

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
    mistakes: analysis.mistakes,
    betterVocabularySuggestions: analysis.betterVocabularySuggestions,
    improvementTip: analysis.improvementTip,
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
    mistakes: session.mistakes,
    betterVocabularySuggestions: session.betterVocabularySuggestions,
    improvementTip: session.improvementTip,
    recommendations: session.aiRecommendations,
    followUpQuestion: session.followUpQuestion,
    motivationQuote: session.motivationQuote,
    coachJson: {
      correctedVersion: session.correctedMessage,
      grammarScore: session.grammarScore,
      vocabularyScore: session.vocabularyScore,
      fluencyScore: session.fluencyScore,
      confidenceScore: session.confidenceScore,
      mistakes: session.mistakes,
      betterVocabularySuggestions: session.betterVocabularySuggestions,
      improvementTip: session.improvementTip,
      followUpQuestion: session.followUpQuestion,
      motivationQuote: session.motivationQuote,
    },
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json({
      conversations: [],
      pagination: {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        total: 0,
        pages: 0,
      },
    });
  }

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
  if (!isDatabaseConnected()) {
    return res.json(emptyStats());
  }

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

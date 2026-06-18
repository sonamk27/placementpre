import { CommunicationSession } from "../models/CommunicationSession.js";
import { DailyProgress } from "../models/DailyProgress.js";
import { dateKey, startOfUtcDay } from "./dailyGeneratorService.js";

const roundOne = (value = 0) => Math.round(Number(value || 0) * 10) / 10;

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const endOfUtcDay = (date) => addDays(startOfUtcDay(date), 1);

const averageOverallExpression = {
  $avg: {
    $divide: [
      {
        $add: [
          "$grammarScore",
          "$vocabularyScore",
          "$fluencyScore",
          "$confidenceScore",
        ],
      },
      4,
    ],
  },
};

export const updateDailyProgressForSession = async (userId, date = new Date()) => {
  const dayStart = startOfUtcDay(date);
  const dayEnd = endOfUtcDay(date);

  const [summary] = await CommunicationSession.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: dayStart, $lt: dayEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        averageGrammarScore: { $avg: "$grammarScore" },
        averageVocabularyScore: { $avg: "$vocabularyScore" },
        averageFluencyScore: { $avg: "$fluencyScore" },
        averageConfidenceScore: { $avg: "$confidenceScore" },
      },
    },
  ]);

  const progress = {
    totalConversations: summary?.totalConversations || 0,
    averageGrammarScore: roundOne(summary?.averageGrammarScore),
    averageVocabularyScore: roundOne(summary?.averageVocabularyScore),
    averageFluencyScore: roundOne(summary?.averageFluencyScore),
    averageConfidenceScore: roundOne(summary?.averageConfidenceScore),
  };

  await DailyProgress.findOneAndUpdate(
    { userId, date: dayStart },
    { $set: progress },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return progress;
};

const getOverallAverages = async (userId) => {
  const [summary] = await CommunicationSession.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        averageGrammarScore: { $avg: "$grammarScore" },
        averageVocabularyScore: { $avg: "$vocabularyScore" },
        averageFluencyScore: { $avg: "$fluencyScore" },
        averageConfidenceScore: { $avg: "$confidenceScore" },
      },
    },
  ]);

  return {
    totalConversations: summary?.totalConversations || 0,
    averageGrammarScore: roundOne(summary?.averageGrammarScore),
    averageVocabularyScore: roundOne(summary?.averageVocabularyScore),
    averageFluencyScore: roundOne(summary?.averageFluencyScore),
    averageConfidenceScore: roundOne(summary?.averageConfidenceScore),
  };
};

const getRangeOverallAverage = async (userId, startDate, endDate) => {
  const [summary] = await CommunicationSession.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        averageOverallScore: averageOverallExpression,
      },
    },
  ]);

  return roundOne(summary?.averageOverallScore);
};

export const getConversationStreak = async (userId, date = new Date()) => {
  const today = startOfUtcDay(date);
  const recent = await DailyProgress.find({
    userId,
    date: { $gte: addDays(today, -90), $lte: today },
    totalConversations: { $gt: 0 },
  })
    .sort({ date: -1 })
    .lean();

  const activeDays = new Set(recent.map((item) => dateKey(item.date)));
  let cursor = activeDays.has(dateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  while (activeDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const getCommunicationStats = async (userId) => {
  const today = startOfUtcDay(new Date());
  const weekStart = addDays(today, -6);
  const nextDay = addDays(today, 1);
  const previousWeekStart = addDays(weekStart, -7);

  const [overall, weeklyRows, currentWeekAverage, previousWeekAverage, streak] =
    await Promise.all([
      getOverallAverages(userId),
      DailyProgress.find({
        userId,
        date: { $gte: weekStart, $lt: nextDay },
      })
        .sort({ date: 1 })
        .lean(),
      getRangeOverallAverage(userId, weekStart, nextDay),
      getRangeOverallAverage(userId, previousWeekStart, weekStart),
      getConversationStreak(userId, today),
    ]);

  const weeklyMap = new Map(weeklyRows.map((row) => [dateKey(row.date), row]));
  const weeklyProgress = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = dateKey(date);
    const row = weeklyMap.get(key);

    return {
      date: key,
      totalConversations: row?.totalConversations || 0,
      averageGrammarScore: roundOne(row?.averageGrammarScore),
      averageVocabularyScore: roundOne(row?.averageVocabularyScore),
      averageFluencyScore: roundOne(row?.averageFluencyScore),
      averageConfidenceScore: roundOne(row?.averageConfidenceScore),
    };
  });

  const weeklyImprovementPercentage =
    previousWeekAverage > 0
      ? roundOne(((currentWeekAverage - previousWeekAverage) / previousWeekAverage) * 100)
      : currentWeekAverage > 0
        ? 100
        : 0;

  return {
    ...overall,
    weeklyProgress,
    weeklyImprovementPercentage,
    conversationStreak: streak,
    charts: {
      grammar: weeklyProgress.map((row) => ({ date: row.date, score: row.averageGrammarScore })),
      vocabulary: weeklyProgress.map((row) => ({ date: row.date, score: row.averageVocabularyScore })),
      fluency: weeklyProgress.map((row) => ({ date: row.date, score: row.averageFluencyScore })),
      confidence: weeklyProgress.map((row) => ({ date: row.date, score: row.averageConfidenceScore })),
    },
  };
};

export const getWeeklyReport = async (userId) => {
  const today = startOfUtcDay(new Date());
  const weekStart = addDays(today, -6);
  const nextDay = addDays(today, 1);
  const stats = await getCommunicationStats(userId);
  const sessions = await CommunicationSession.find({
    userId,
    createdAt: { $gte: weekStart, $lt: nextDay },
  })
    .sort({ createdAt: -1 })
    .lean();

  const scoreAverages = [
    ["Grammar", stats.averageGrammarScore],
    ["Vocabulary", stats.averageVocabularyScore],
    ["Fluency", stats.averageFluencyScore],
    ["Confidence", stats.averageConfidenceScore],
  ];
  const focusArea = scoreAverages.sort((a, b) => a[1] - b[1])[0]?.[0] || "Grammar";

  return {
    period: { from: dateKey(weekStart), to: dateKey(today) },
    totalConversations: sessions.length,
    weeklyImprovementPercentage: stats.weeklyImprovementPercentage,
    conversationStreak: stats.conversationStreak,
    focusArea,
    highlights: sessions.slice(0, 3).map((session) => ({
      topic: session.topic,
      date: session.createdAt,
      score: roundOne(
        (session.grammarScore +
          session.vocabularyScore +
          session.fluencyScore +
          session.confidenceScore) /
          4,
      ),
    })),
  };
};

export const getMonthlyPerformanceSummary = async (userId) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const rows = await CommunicationSession.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: monthStart, $lt: nextMonth },
      },
    },
    {
      $group: {
        _id: {
          week: { $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] } },
        },
        conversations: { $sum: 1 },
        averageGrammarScore: { $avg: "$grammarScore" },
        averageVocabularyScore: { $avg: "$vocabularyScore" },
        averageFluencyScore: { $avg: "$fluencyScore" },
        averageConfidenceScore: { $avg: "$confidenceScore" },
      },
    },
    { $sort: { "_id.week": 1 } },
  ]);

  return {
    month: monthStart.toISOString().slice(0, 7),
    totalConversations: rows.reduce((sum, row) => sum + row.conversations, 0),
    weeks: rows.map((row) => ({
      week: row._id.week,
      totalConversations: row.conversations,
      averageGrammarScore: roundOne(row.averageGrammarScore),
      averageVocabularyScore: roundOne(row.averageVocabularyScore),
      averageFluencyScore: roundOne(row.averageFluencyScore),
      averageConfidenceScore: roundOne(row.averageConfidenceScore),
    })),
  };
};

export const toHistoryCsv = (sessions) => {
  const headers = [
    "date",
    "topic",
    "userMessage",
    "correctedMessage",
    "grammarScore",
    "vocabularyScore",
    "fluencyScore",
    "confidenceScore",
    "aiFeedback",
    "mistakes",
    "betterVocabularySuggestions",
    "improvementTip",
    "aiRecommendations",
    "motivationQuote",
    "aiModel",
    "aiProvider",
  ];

  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  };

  const rows = sessions.map((session) =>
    [
      session.createdAt?.toISOString?.() || session.createdAt,
      session.topic,
      session.userMessage,
      session.correctedMessage,
      session.grammarScore,
      session.vocabularyScore,
      session.fluencyScore,
      session.confidenceScore,
      session.aiFeedback,
      session.mistakes?.join("; "),
      session.betterVocabularySuggestions?.join("; "),
      session.improvementTip,
      session.aiRecommendations?.join("; "),
      session.motivationQuote,
      session.aiModel,
      session.aiProvider,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const CoachAnalysisSchema = z.object({
  correctedMessage: z.string().min(1),
  grammarScore: z.number().int().min(1).max(10),
  vocabularyScore: z.number().int().min(1).max(10),
  fluencyScore: z.number().int().min(1).max(10),
  confidenceScore: z.number().int().min(1).max(10),
  feedback: z.string().min(1),
  recommendations: z.array(z.string().min(1)).min(1).max(6),
  followUpQuestion: z.string().min(1),
  motivationQuote: z.string().min(1),
});

const instructions = `
You are an English Communication Coach for placement and interview preparation.
For every learner response, continue the conversation naturally, correct grammar,
improve sentence structure, suggest stronger vocabulary, rate grammar,
vocabulary, fluency, and confidence from 1 to 10, explain mistakes clearly,
provide practical improvement tips, ask one follow-up question, and include one
short motivational quote.
Keep feedback specific, supportive, and useful for a student preparing for jobs.
`;

let client;

const getOpenAIClient = () => {
  if (!config.openai.apiKey) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: config.openai.apiKey });
  }

  return client;
};

const clampScore = (score) => Math.max(1, Math.min(10, Math.round(score)));

const localFallbackAnalysis = (message, topic) => {
  const trimmed = message.trim();
  const sentenceCount = Math.max(1, trimmed.split(/[.!?]+/).filter(Boolean).length);
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const hasCapitalStart = /^[A-Z]/.test(trimmed);
  const hasPunctuation = /[.!?]$/.test(trimmed);
  const repeatedWords = /\b(\w+)\s+\1\b/i.test(trimmed);

  const grammarScore = clampScore(6 + Number(hasCapitalStart) + Number(hasPunctuation) - Number(repeatedWords));
  const vocabularyScore = clampScore(wordCount > 35 ? 8 : wordCount > 18 ? 7 : 6);
  const fluencyScore = clampScore(sentenceCount > 1 ? 8 : 6);
  const confidenceScore = clampScore(trimmed.length > 80 ? 8 : 6);

  const correctedMessage = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}${
    hasPunctuation ? "" : "."
  }`;

  return {
    correctedMessage,
    grammarScore,
    vocabularyScore,
    fluencyScore,
    confidenceScore,
    feedback:
      "Good attempt. Focus on using complete sentences, consistent tense, and one measurable detail to make your answer stronger.",
    recommendations: [
      "Start with a direct answer before adding details.",
      "Use action verbs such as implemented, improved, optimized, or collaborated.",
      "End with the result or learning from your experience.",
    ],
    followUpQuestion: `Can you add one measurable result related to "${topic}"?`,
    motivationQuote: "Every polished answer starts as one honest attempt.",
  };
};

export const analyzeWithCommunicationCoach = async ({ message, topic }) => {
  const openai = getOpenAIClient();

  if (!openai) {
    if (config.allowAiFallback) {
      return localFallbackAnalysis(message, topic);
    }

    throw new HttpError(503, "OpenAI API key is not configured");
  }

  const request = {
    model: config.openai.model,
    input: [
      {
        role: "system",
        content: instructions,
      },
      {
        role: "user",
        content: `Daily topic: ${topic}\nLearner response: ${message}`,
      },
    ],
    text: {
      format: zodTextFormat(CoachAnalysisSchema, "communication_coach_analysis"),
      verbosity: "low",
    },
  };

  if (/^(gpt-5|o\d|o-)/.test(config.openai.model)) {
    request.reasoning = { effort: "low" };
  }

  try {
    const response = await openai.responses.parse(request);
    return response.output_parsed;
  } catch (error) {
    if (config.allowAiFallback) {
      return localFallbackAnalysis(message, topic);
    }

    throw new HttpError(502, "AI communication analysis failed", error.message);
  }
};

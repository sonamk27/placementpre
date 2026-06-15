import OpenAI, { toFile } from "openai";
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
  mistakes: z.array(z.string().min(1)).min(1).max(6),
  betterVocabularySuggestions: z.array(z.string().min(1)).min(1).max(6),
  improvementTip: z.string().min(1),
  feedback: z.string().min(1),
  recommendations: z.array(z.string().min(1)).min(1).max(6),
  followUpQuestion: z.string().min(1),
  motivationQuote: z.string().min(1),
});

const instructions = `
You are an expert English Communication Coach.
Analyze the learner's message and return JSON with:
1. correctedMessage: the corrected version
2. grammarScore: 1-10
3. vocabularyScore: 1-10
4. fluencyScore: 1-10
5. confidenceScore: 1-10
6. mistakes: clear mistakes found in the original message
7. betterVocabularySuggestions: stronger vocabulary or phrase replacements
8. improvementTip: exactly one practical improvement tip
9. followUpQuestion: exactly one natural follow-up question
10. motivationQuote: exactly one short motivational quote

Also include:
- feedback: a concise explanation of the main issues and strengths
- recommendations: short actionable recommendations for practice

Keep the tone specific, supportive, and useful for a student preparing for jobs.
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

const audioExtensionByMimeType = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
};

const getCleanMimeType = (mimeType = "") =>
  String(mimeType).split(";")[0].trim().toLowerCase() || "audio/webm";

const localFallbackAnalysis = (message, topic) => {
  const trimmed = message.trim();
  const sentenceCount = Math.max(1, trimmed.split(/[.!?]+/).filter(Boolean).length);
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const hasCapitalStart = /^[A-Z]/.test(trimmed);
  const hasPunctuation = /[.!?]$/.test(trimmed);
  const repeatedWords = /\b(\w+)\s+\1\b/i.test(trimmed);
  const hasActionVerb =
    /\b(built|created|developed|implemented|debugged|improved|optimized|designed|led|collaborated|learned|tested|deployed)\b/i.test(
      trimmed,
    );
  const hasOutcome =
    /\b(result|impact|reduced|increased|improved|saved|helped|users?|faster|time|percent|%|\d+)\b/i.test(
      trimmed,
    );
  const hasStructure = sentenceCount >= 2 || /\b(first|then|after|because|finally)\b/i.test(trimmed);

  const grammarScore = clampScore(
    6 + Number(hasCapitalStart) + Number(hasPunctuation) - Number(repeatedWords),
  );
  const vocabularyScore = clampScore(
    5 + Number(hasActionVerb) + Number(hasOutcome) + Number(wordCount > 45),
  );
  const fluencyScore = clampScore(5 + Number(hasStructure) + Number(sentenceCount > 2));
  const confidenceScore = clampScore(
    5 + Number(wordCount > 35) + Number(hasActionVerb) + Number(hasOutcome),
  );

  const correctedMessage = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}${
    hasPunctuation ? "" : "."
  }`;
  const missingPoints = [
    wordCount < 25 ? "Expand the answer with one concrete example." : "",
    hasActionVerb ? "" : "Use a clear action verb such as built, implemented, debugged, or improved.",
    hasOutcome ? "" : "Add an outcome, metric, or user benefit.",
    hasStructure ? "" : "Organize the answer as situation, action, and result.",
    repeatedWords ? "Avoid repeated words in the same phrase." : "",
  ].filter(Boolean);

  return {
    correctedMessage,
    grammarScore,
    vocabularyScore,
    fluencyScore,
    confidenceScore,
    mistakes:
      missingPoints.length > 0
        ? missingPoints.slice(0, 4)
        : ["The answer is clear; make it stronger with one more specific result."],
    betterVocabularySuggestions: [
      "made -> built or implemented",
      "good -> effective or reliable",
      "worked on -> contributed to or owned",
    ],
    improvementTip:
      "Answer in three parts: context, your action, and the measurable or visible result.",
    feedback:
      hasActionVerb && hasOutcome
        ? "Good attempt. Your answer has a clear action and result; make it interview-ready by adding brief context before the action."
        : "Your answer is understandable, but it needs stronger interview structure. Add what happened, what you personally did, and what changed because of it.",
    recommendations: [
      "Start with one sentence that directly answers the question.",
      "Use one specific project or situation instead of speaking generally.",
      "End with the result, learning, or user impact.",
    ],
    followUpQuestion: `What was the most visible result or learning from your answer to "${topic}"?`,
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

export const transcribeCommunicationAudio = async ({
  audioBuffer,
  mimeType,
  topic,
}) => {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new HttpError(400, "Audio recording is required");
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return {
      text: "",
      message:
        "Speech transcription needs OPENAI_API_KEY, or use a browser with built-in speech recognition.",
    };
  }

  const cleanMimeType = getCleanMimeType(mimeType);
  const extension = audioExtensionByMimeType[cleanMimeType] || "webm";
  const file = await toFile(audioBuffer, `communication-answer.${extension}`, {
    type: cleanMimeType,
  });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: config.openai.transcriptionModel,
      language: "en",
      prompt: topic
        ? `This is a student's spoken answer for this placement communication prompt: ${topic}`
        : "This is a student's spoken answer for placement communication practice.",
    });

    return {
      text: String(transcription?.text || "").trim(),
    };
  } catch (error) {
    throw new HttpError(502, "Audio transcription failed", error.message);
  }
};

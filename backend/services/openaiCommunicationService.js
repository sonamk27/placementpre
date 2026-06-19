import OpenAI, { toFile } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { supportsReasoningModel } from "../config/aiModels.js";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const CoachAnalysisSchema = z.object({
  correctedMessage: z.string().min(1),
  grammarScore: z.number().int().min(1).max(10),
  vocabularyScore: z.number().int().min(1).max(10),
  fluencyScore: z.number().int().min(1).max(10),
  confidenceScore: z.number().int().min(1).max(10),
  overallScore: z.number().int().min(1).max(10),
  betterInterviewAnswer: z.string().min(1),
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
1. correctedMessage: the grammar-corrected version of the learner's answer
2. grammarScore: integer 1-10 only
3. vocabularyScore: integer 1-10 only
4. fluencyScore: integer 1-10 only
5. confidenceScore: integer 1-10 only
6. overallScore: one final interview-answer score, integer 1-10 only
7. betterInterviewAnswer: a polished interview-ready answer based on the learner's answer and the daily topic
8. mistakes: clear mistakes found in the original message
9. betterVocabularySuggestions: stronger vocabulary or phrase replacements
10. improvementTip: exactly one practical improvement tip
11. followUpQuestion: exactly one natural follow-up question
12. motivationQuote: exactly one short motivational quote

Also include:
- feedback: a concise explanation of the main issues and strengths
- recommendations: short actionable recommendations for practice

Score every answer strictly out of 10, never as a percentage.
The correctedMessage should preserve the learner's meaning.
The betterInterviewAnswer should sound natural in a placement interview, use first person, and include a clear point, example, and result when possible.
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

const hasModel = (models, modelId) =>
  models.some((model) => model.id === String(modelId || "").trim());

export const getCommunicationModelOptions = () => ({
  defaultCommunicationModel: config.openai.model,
  defaultTranscriptionModel: config.openai.transcriptionModel,
  communicationModels: config.openai.communicationModels,
  transcriptionModels: config.openai.transcriptionModels,
});

export const isSupportedCommunicationModel = (modelId) =>
  hasModel(config.openai.communicationModels, modelId);

export const isSupportedTranscriptionModel = (modelId) =>
  hasModel(config.openai.transcriptionModels, modelId);

export const resolveCommunicationModel = (modelId) => {
  const selectedModel = String(modelId || config.openai.model).trim();

  if (!isSupportedCommunicationModel(selectedModel)) {
    throw new HttpError(400, "Unsupported communication AI model");
  }

  return selectedModel;
};

export const resolveTranscriptionModel = (modelId) => {
  const selectedModel = String(modelId || config.openai.transcriptionModel).trim();

  if (!isSupportedTranscriptionModel(selectedModel)) {
    throw new HttpError(400, "Unsupported transcription AI model");
  }

  return selectedModel;
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
  const overallScore = clampScore(
    (grammarScore + vocabularyScore + fluencyScore + confidenceScore) / 4,
  );

  const correctedMessage = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}${
    hasPunctuation ? "" : "."
  }`;
  const betterInterviewAnswer =
    wordCount >= 20
      ? `${correctedMessage} To make this stronger in an interview, I would add the exact situation, the action I personally took, and the result or learning. This shows that I can explain my work clearly and connect technology decisions to practical impact.`
      : `I would answer this by first explaining the concept in simple words, then connecting it to one project feature I built or improved. I would mention the problem, the technology or approach I used, my exact contribution, and the result for users, performance, or learning. This makes the answer clear, structured, and interview-ready.`;
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
    overallScore,
    betterInterviewAnswer,
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

export const analyzeWithCommunicationCoach = async ({ message, topic, model }) => {
  const selectedModel = resolveCommunicationModel(model);
  const openai = getOpenAIClient();

  if (!openai) {
    if (config.allowAiFallback) {
      return {
        ...localFallbackAnalysis(message, topic),
        model: selectedModel,
        provider: "local-fallback",
      };
    }

    throw new HttpError(503, "OpenAI API key is not configured");
  }

  const request = {
    model: selectedModel,
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

  if (supportsReasoningModel(selectedModel)) {
    request.reasoning = { effort: "low" };
  }

  try {
    const response = await openai.responses.parse(request);
    return {
      ...response.output_parsed,
      model: selectedModel,
      provider: "openai",
    };
  } catch (error) {
    if (config.allowAiFallback) {
      return {
        ...localFallbackAnalysis(message, topic),
        model: selectedModel,
        provider: "local-fallback",
      };
    }

    throw new HttpError(502, "AI communication analysis failed", error.message);
  }
};

export const transcribeCommunicationAudio = async ({
  audioBuffer,
  mimeType,
  topic,
  model,
}) => {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new HttpError(400, "Audio recording is required");
  }

  const openai = getOpenAIClient();
  const selectedModel = resolveTranscriptionModel(model);

  if (!openai) {
    return {
      text: "",
      model: selectedModel,
      provider: "local-fallback",
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
      model: selectedModel,
      language: "en",
      prompt: topic
        ? `This is a student's spoken answer for this placement communication prompt: ${topic}`
        : "This is a student's spoken answer for placement communication practice.",
    });

    return {
      text: String(transcription?.text || "").trim(),
      model: selectedModel,
      provider: "openai",
    };
  } catch (error) {
    throw new HttpError(502, "Audio transcription failed", error.message);
  }
};

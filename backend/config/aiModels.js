export const DEFAULT_COMMUNICATION_MODEL = "gpt-5.5";
export const DEFAULT_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

const communicationModelCatalog = [
  {
    id: "gpt-5.5",
    label: "GPT-5.5",
    description: "Best default for detailed communication coaching.",
    tier: "frontier",
    supportsReasoning: true,
    recommended: true,
  },
  {
    id: "gpt-5.5-pro",
    label: "GPT-5.5 Pro",
    description: "Highest quality option for deeper feedback.",
    tier: "frontier",
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4",
    label: "GPT-5.4",
    description: "Balanced quality with lower cost than GPT-5.5.",
    tier: "frontier",
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    description: "Fast, lower-cost coaching for daily practice.",
    tier: "frontier",
    supportsReasoning: true,
  },
  {
    id: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    description: "Fastest low-cost option for shorter feedback.",
    tier: "frontier",
    supportsReasoning: true,
  },
];

const transcriptionModelCatalog = [
  {
    id: "gpt-4o-mini-transcribe",
    label: "GPT-4o Mini Transcribe",
    description: "Default speech-to-text model for quick practice audio.",
    recommended: true,
  },
  {
    id: "gpt-4o-transcribe",
    label: "GPT-4o Transcribe",
    description: "Higher quality speech-to-text model.",
  },
];

const parseModelList = (value) =>
  String(value || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

const toCustomModel = (id) => ({
  id,
  label: id,
  description: "Configured from environment.",
  tier: "custom",
  supportsReasoning: supportsReasoningModel(id),
  custom: true,
});

const uniqById = (models) => {
  const seen = new Set();

  return models.filter((model) => {
    if (!model?.id || seen.has(model.id)) {
      return false;
    }

    seen.add(model.id);
    return true;
  });
};

export const supportsReasoningModel = (model) =>
  /^(gpt-5|o\d|o-)/.test(String(model || ""));

export const buildModelRegistry = ({
  communicationDefault = DEFAULT_COMMUNICATION_MODEL,
  transcriptionDefault = DEFAULT_TRANSCRIPTION_MODEL,
  extraCommunicationModels = "",
  extraTranscriptionModels = "",
} = {}) => {
  const communicationModels = uniqById([
    ...communicationModelCatalog,
    ...parseModelList(extraCommunicationModels).map(toCustomModel),
    toCustomModel(communicationDefault),
  ]).map((model) => ({
    ...model,
    default: model.id === communicationDefault,
  }));

  const transcriptionModels = uniqById([
    ...transcriptionModelCatalog,
    ...parseModelList(extraTranscriptionModels).map((id) => ({
      id,
      label: id,
      description: "Configured from environment.",
      custom: true,
    })),
    {
      id: transcriptionDefault,
      label: transcriptionDefault,
      description: "Configured default speech-to-text model.",
      custom: true,
    },
  ]).map((model) => ({
    ...model,
    default: model.id === transcriptionDefault,
  }));

  return {
    communicationDefault,
    transcriptionDefault,
    communicationModels,
    transcriptionModels,
  };
};

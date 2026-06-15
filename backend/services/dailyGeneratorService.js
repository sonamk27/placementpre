const topics = [
  "Tell me about yourself for a fresher software developer role. Include your skills, one project, and the kind of role you are targeting.",
  "Describe one project you built that solved a real user problem. Explain the problem, your exact contribution, and the result.",
  "Tell me about a difficult bug you fixed. What was the symptom, how did you debug it, and what did you learn?",
  "Explain a technical concept from your project to a non-technical interviewer. Keep it simple and connect it to user value.",
  "Why should a company hire you for a MERN developer role? Support your answer with skills, project proof, and learning attitude.",
  "Describe a time you learned a new technology quickly. What did you build or improve using it?",
  "Tell me about a mistake you made in a project. What changed in your process after that?",
  "Describe how you work in a team when tasks are divided. Include communication, ownership, and delivery.",
  "Explain how you plan before starting a coding task. Mention requirement clarity, approach, testing, and review.",
  "Describe a time you improved performance, usability, or workflow in a project. What changed and how did you measure it?",
  "Tell me about a time you received feedback on your work. How did you respond and what improved?",
  "Explain your strongest project as if this is the final HR round. Cover purpose, tech stack, challenges, and impact.",
];

const vocabulary = [
  {
    word: "impact",
    meaning: "a measurable effect or result",
    example: "My project created impact by reducing manual tracking time.",
  },
  {
    word: "iterate",
    meaning: "to improve something through repeated versions",
    example: "I iterated on the UI after collecting user feedback.",
  },
  {
    word: "collaborate",
    meaning: "to work with others toward a shared goal",
    example: "I collaborated with teammates to divide API and UI tasks.",
  },
  {
    word: "optimize",
    meaning: "to make something faster, cleaner, or more efficient",
    example: "I optimized the query by adding indexes and filtering early.",
  },
  {
    word: "resilient",
    meaning: "able to recover and keep working under pressure",
    example: "I stayed resilient when deployment failed and debugged step by step.",
  },
  {
    word: "clarify",
    meaning: "to make an idea easier to understand",
    example: "I clarified the requirements before writing the solution.",
  },
  {
    word: "ownership",
    meaning: "responsibility for delivering and improving work",
    example: "I took ownership of testing the login flow end to end.",
  },
];

const quotes = [
  "Speak with clarity, improve with patience, and confidence will follow.",
  "Every polished answer starts as one honest attempt.",
  "Small daily practice turns hesitation into presence.",
  "Strong communication is built one clearer sentence at a time.",
  "Progress is not louder speech; it is clearer thought.",
  "Your next answer can be sharper than your last one.",
  "Practice gives your ideas a stronger voice.",
];

const hashText = (value) =>
  [...String(value)].reduce((total, char) => total + char.charCodeAt(0), 0);

export const startOfUtcDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const dateKey = (date = new Date()) =>
  startOfUtcDay(date).toISOString().slice(0, 10);

const pickDaily = (items, userId, date, salt = "") => {
  const seed = hashText(`${userId}:${dateKey(date)}:${salt}`);
  return items[seed % items.length];
};

let lastRandomTopic = "";

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const pickRandomExcept = (items, previous) => {
  if (items.length < 2) {
    return pickRandom(items);
  }

  let next = pickRandom(items);

  while (next === previous) {
    next = pickRandom(items);
  }

  return next;
};

export const getDailyCommunicationStarter = (userId, date = new Date()) => ({
  date: dateKey(date),
  topic: pickDaily(topics, userId, date, "topic"),
  vocabularyWord: pickDaily(vocabulary, userId, date, "vocabulary"),
  motivationQuote: pickDaily(quotes, userId, date, "quote"),
});

export const getRandomCommunicationStarter = () => {
  const topic = pickRandomExcept(topics, lastRandomTopic);
  lastRandomTopic = topic;

  return {
    date: dateKey(),
    topic,
    vocabularyWord: pickRandom(vocabulary),
    motivationQuote: pickRandom(quotes),
  };
};

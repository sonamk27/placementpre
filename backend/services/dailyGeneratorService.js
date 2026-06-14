const topics = [
  "Describe a project where you solved a real user problem.",
  "Explain how you handled a difficult bug during development.",
  "Tell an interviewer about a time you learned a new technology quickly.",
  "Describe your strengths as a teammate in a software project.",
  "Explain one technical concept to a non-technical audience.",
  "Tell me about yourself for a fresher software developer role.",
  "Describe a time you improved a process or saved time.",
  "Explain why a company should hire you for a MERN developer role.",
  "Describe a mistake you made and what you changed afterward.",
  "Share how you prepare before starting a coding task.",
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

export const getDailyCommunicationStarter = (userId, date = new Date()) => ({
  date: dateKey(date),
  topic: pickDaily(topics, userId, date, "topic"),
  vocabularyWord: pickDaily(vocabulary, userId, date, "vocabulary"),
  motivationQuote: pickDaily(quotes, userId, date, "quote"),
});

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

const technologyTopics = [
  {
    name: "React Hooks",
    focus: "state, side effects, and reusable logic in function components",
    prompts: [
      "Explain React Hooks to an interviewer. Cover why hooks are used, one hook you know well, and one project example.",
      "Describe a project feature where React Hooks helped you manage UI state or side effects.",
      "What is the difference between useState and useEffect? Explain it with a practical example.",
    ],
    keyPoints: [
      "Hooks let function components manage state and side effects.",
      "useState stores UI state; useEffect runs side-effect logic after render.",
      "Custom hooks help reuse component logic cleanly.",
    ],
  },
  {
    name: "REST API",
    focus: "client-server communication using resources, HTTP methods, and status codes",
    prompts: [
      "Explain REST API to an interviewer. Include resources, HTTP methods, and one API you built or consumed.",
      "Describe how your frontend talks to a backend API in a MERN project.",
      "How would you design a simple REST endpoint for job applications? Mention method, route, request, and response.",
    ],
    keyPoints: [
      "REST organizes data as resources such as users, jobs, or applications.",
      "GET, POST, PATCH, and DELETE describe the action on a resource.",
      "Status codes and validation make APIs predictable for the frontend.",
    ],
  },
  {
    name: "JWT Authentication",
    focus: "secure login sessions using signed tokens and protected routes",
    prompts: [
      "Explain JWT authentication for a placement interview. Cover login, token storage, and protected APIs.",
      "Describe how you would protect a dashboard route after login.",
      "What are common JWT security precautions in a full-stack app?",
    ],
    keyPoints: [
      "A JWT is signed by the server after successful login.",
      "Protected APIs verify the token before returning private data.",
      "Tokens should expire and should not expose sensitive information.",
    ],
  },
  {
    name: "MongoDB Schema Design",
    focus: "documents, fields, validation, indexes, and relationships",
    prompts: [
      "Explain how you design a MongoDB schema for a MERN project.",
      "Describe one MongoDB collection from your project and why you chose those fields.",
      "When would you embed data in MongoDB and when would you reference another document?",
    ],
    keyPoints: [
      "Documents store related data together in flexible JSON-like records.",
      "Validation keeps data consistent before it reaches business logic.",
      "Indexes speed up common queries but should be chosen carefully.",
    ],
  },
  {
    name: "Express Middleware",
    focus: "request processing, validation, authentication, logging, and error handling",
    prompts: [
      "Explain Express middleware to an interviewer with one real example.",
      "Describe the request flow in an Express API from route to controller.",
      "How would you use middleware for validation and authentication in a placement project?",
    ],
    keyPoints: [
      "Middleware runs between the request and the final route handler.",
      "It is useful for auth, validation, logging, parsing, and errors.",
      "Reusable middleware keeps controllers smaller and cleaner.",
    ],
  },
  {
    name: "JavaScript Promises",
    focus: "asynchronous code, async/await, error handling, and API calls",
    prompts: [
      "Explain JavaScript Promises in a simple interview answer.",
      "Describe how async/await improves API call code in a React or Node app.",
      "How do you handle errors when a Promise-based API request fails?",
    ],
    keyPoints: [
      "A Promise represents a future success or failure result.",
      "async/await makes asynchronous code read more like synchronous code.",
      "try/catch handles errors cleanly around awaited operations.",
    ],
  },
  {
    name: "SQL Joins",
    focus: "combining rows from related tables using keys",
    prompts: [
      "Explain SQL joins to an interviewer using a students and applications example.",
      "What is the difference between INNER JOIN and LEFT JOIN?",
      "Describe a query where joins helped you answer a real data question.",
    ],
    keyPoints: [
      "Joins combine related rows from multiple tables.",
      "INNER JOIN returns matching rows; LEFT JOIN keeps all rows from the left table.",
      "Indexes on join keys can improve query performance.",
    ],
  },
  {
    name: "Git Branching",
    focus: "feature branches, commits, pull requests, and safe collaboration",
    prompts: [
      "Explain your Git workflow in a project interview.",
      "Describe why teams use branches and pull requests.",
      "How do you handle a merge conflict in a calm, practical way?",
    ],
    keyPoints: [
      "Branches isolate feature work from stable code.",
      "Small commits make review and rollback easier.",
      "Pull requests help teams discuss and verify changes before merging.",
    ],
  },
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

const buildDailyTarget = (technology) =>
  `Understand ${technology.name}: ${technology.focus}. Prepare one interview answer with a definition, one project use, and one result.`;

const serializeTechnology = (technology) => ({
  name: technology.name,
  focus: technology.focus,
  keyPoints: technology.keyPoints,
});

const buildCommunicationStarter = ({
  technology,
  topic,
  userId = "guest",
  date = new Date(),
  daily = false,
}) => ({
  date: dateKey(date),
  topic,
  dailyTarget: buildDailyTarget(technology),
  dailyTechnology: serializeTechnology(technology),
  vocabularyWord: daily
    ? pickDaily(vocabulary, userId, date, "vocabulary")
    : pickRandom(vocabulary),
  motivationQuote: daily ? pickDaily(quotes, userId, date, "quote") : pickRandom(quotes),
});

export const getDailyCommunicationStarter = (userId, date = new Date()) => ({
  ...buildCommunicationStarter({
    technology: pickDaily(technologyTopics, userId, date, "technology"),
    topic: pickDaily(
      pickDaily(technologyTopics, userId, date, "technology").prompts,
      userId,
      date,
      "technology-prompt",
    ),
    userId,
    date,
    daily: true,
  }),
});

export const getRandomCommunicationStarter = (userId = "guest", date = new Date()) => {
  const technology = pickDaily(technologyTopics, userId, date, "technology");
  const topic = pickRandomExcept(technology.prompts, lastRandomTopic);

  lastRandomTopic = topic;

  return buildCommunicationStarter({
    technology,
    topic,
    userId,
    date,
  });
};

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Award,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  Briefcase,
  Building2,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Cpu,
  Database,
  FileText,
  Flame,
  Github,
  GraduationCap,
  Layers,
  Lightbulb,
  LineChart,
  ListChecks,
  Map,
  Menu,
  Mic,
  MessageCircle,
  MessageSquareText,
  Mic2,
  Moon,
  Pencil,
  Play,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Square,
  Sun,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  UploadCloud,
  User,
  Users,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { communicationApi, dsaApi, getAuthSession, plannerApi } from "./api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const primaryGradient =
  "linear-gradient(135deg, #6C63FF, #8B5CF6, #A855F7)";
const COMMUNICATION_MODEL_KEY = "prepmate_communication_model";
const fallbackCommunicationModels = [
  {
    id: "gpt-5.5",
    label: "GPT-5.5",
    description: "Best default for detailed communication coaching.",
    default: true,
  },
];

const getStoredCommunicationModel = () => {
  if (typeof window === "undefined") {
    return fallbackCommunicationModels[0].id;
  }

  return (
    window.localStorage.getItem(COMMUNICATION_MODEL_KEY) ||
    fallbackCommunicationModels[0].id
  );
};

const DSA_LOCAL_ACTIVITY_KEY = "prepmate_dsa_practice_activity";

const toLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDaysToDateKey = (value, days) => {
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day || 1);

  date.setDate(date.getDate() + days);

  return toLocalDateKey(date);
};

const getLocalDsaActivityDates = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(DSA_LOCAL_ACTIVITY_KEY));

    return Array.isArray(stored)
      ? stored.filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item))
      : [];
  } catch {
    return [];
  }
};

const saveLocalDsaActivityDates = (dates) => {
  if (typeof window === "undefined") {
    return;
  }

  const uniqueDates = [...new Set(dates)].sort();
  window.localStorage.setItem(DSA_LOCAL_ACTIVITY_KEY, JSON.stringify(uniqueDates));
};

const getCurrentDsaStreakFromKeys = (dateKeys, dateKey = toLocalDateKey()) => {
  const activeDays = new Set(dateKeys);
  let cursor = activeDays.has(dateKey) ? dateKey : addDaysToDateKey(dateKey, -1);
  let streak = 0;

  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }

  return streak;
};

const getBestDsaStreakFromKeys = (dateKeys) => {
  const sortedDates = [...new Set(dateKeys)].sort();
  let best = 0;
  let current = 0;
  let previous = null;

  for (const date of sortedDates) {
    current = previous && addDaysToDateKey(previous, 1) === date ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  }

  return best;
};

const buildLocalDsaActivity = (dateKey = toLocalDateKey()) =>
  Array.from({ length: 28 }, (_, index) => ({
    date: addDaysToDateKey(dateKey, index - 27),
    completed: false,
  }));

const mergeLocalDsaPractice = (payload) => {
  if (!payload || payload.saved !== false) {
    return payload;
  }

  const date = payload.date || toLocalDateKey();
  const dateKeys = payload.completedToday
    ? [...getLocalDsaActivityDates(), date]
    : getLocalDsaActivityDates();
  const activeDays = new Set(dateKeys);
  const weeklyActivity = Array.isArray(payload.weeklyActivity)
    ? payload.weeklyActivity
    : buildLocalDsaActivity(date);

  return {
    ...payload,
    date,
    completedToday: activeDays.has(date),
    currentStreak: getCurrentDsaStreakFromKeys([...activeDays], date),
    bestStreak: getBestDsaStreakFromKeys([...activeDays]),
    totalSolved: activeDays.size,
    weeklyActivity: weeklyActivity.map((day) => ({
      ...day,
      completed: activeDays.has(day.date),
    })),
  };
};

const rememberLocalDsaPractice = (payload) => {
  const date = payload?.date || toLocalDateKey();
  saveLocalDsaActivityDates([...getLocalDsaActivityDates(), date]);

  return mergeLocalDsaPractice({
    ...payload,
    date,
    completedToday: true,
    saved: false,
  });
};

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "DSA Practice", path: "/dsa", icon: Code2 },
  { label: "SQL Practice", path: "/sql", icon: Database },
  { label: "Communication Coach", path: "/communication", icon: Mic2 },
  { label: "Interview Preparation", path: "/interview", icon: MessageSquareText },
  { label: "AI Mentor", path: "/ai-mentor", icon: Bot },
  { label: "Daily Planner", path: "/daily-planner", icon: CalendarCheck },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/settings", icon: Settings },
];

const mobileNavItems = [
  { label: "Home", path: "/dashboard", icon: BarChart3 },
  { label: "DSA", path: "/dsa", icon: Code2 },
  { label: "SQL", path: "/sql", icon: Database },
  { label: "Coach", path: "/communication", icon: Mic2 },
  { label: "Plan", path: "/daily-planner", icon: CalendarCheck },
];

const progressStats = [
  ["DSA Questions Solved", 74, 100, "6 solved today", Code2, "from-violet-500 to-fuchsia-500"],
  ["SQL Problems Solved", 48, 60, "3 query drills", Database, "from-cyan-400 to-blue-500"],
  ["Communication Practice", 82, 100, "18 min speaking", Mic2, "from-emerald-400 to-teal-500"],
  ["Interview Practice", 63, 100, "2 mock rounds", MessageCircle, "from-amber-300 to-orange-500"],
  ["Daily Streak", 21, 30, "21 days active", Flame, "from-rose-400 to-pink-500"],
];

const progressRoutes = {
  "DSA Questions Solved": "/dsa",
  "SQL Problems Solved": "/sql",
  "Communication Practice": "/communication",
  "Interview Practice": "/interview",
  "Daily Streak": "/daily-planner",
};

const dsaTopics = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Tree",
  "Graph",
  "Dynamic Programming",
];

const dsaProblems = {
  Easy: {
    title: "Two Sum With Hash Map",
    tags: ["Arrays", "Hashing"],
    acceptance: "71%",
    time: "O(n)",
    prompt: "Find two indices whose values add up to the target.",
  },
  Medium: {
    title: "Longest Substring Without Repeat",
    tags: ["Strings", "Sliding Window"],
    acceptance: "48%",
    time: "O(n)",
    prompt: "Return the length of the longest unique-character window.",
  },
  Hard: {
    title: "Minimum Window Substring",
    tags: ["Strings", "Two Pointers"],
    acceptance: "32%",
    time: "O(n)",
    prompt: "Find the smallest source window containing every target character.",
  },
};

const sqlSchema = [
  { table: "students", fields: ["id", "name", "branch", "cgpa"] },
  { table: "applications", fields: ["student_id", "company", "status"] },
  { table: "interviews", fields: ["company", "round", "score"] },
];

const interviewData = {
  HR: {
    title: "HR Interview",
    score: 86,
    rating: "Clear and confident",
    feedback: "Add one measurable result to every answer.",
    prompts: ["Tell me about yourself", "Why should we hire you?"],
  },
  Technical: {
    title: "Technical Interview",
    score: 78,
    rating: "Strong fundamentals",
    feedback: "Explain tradeoffs before writing the final solution.",
    prompts: ["Explain closures", "Design a URL shortener"],
  },
  Behavioral: {
    title: "Behavioral Interview",
    score: 82,
    rating: "Structured examples",
    feedback: "Use STAR stories with more concise endings.",
    prompts: ["Conflict in a team", "A time you failed"],
  },
};

const plannerGoals = [
  ["Solve 3 DSA Questions", "High", "75 min"],
  ["Practice SQL for 30 Minutes", "Medium", "30 min"],
  ["Communication Practice", "High", "20 min"],
  ["Apply for Jobs", "Medium", "25 min"],
  ["Project Development", "Low", "60 min"],
];

const defaultPlannerGoals = plannerGoals.map(([title, priority, estimate], index) => ({
  id: `goal-${index}`,
  title,
  priority,
  estimate,
  completed: false,
}));

const defaultPlannerTasks = [
  ["Revise sliding window", "High", "45 min"],
  ["Build SQL joins notes", "Medium", "30 min"],
  ["Record intro answer", "High", "15 min"],
].map(([title, priority, estimate], index) => ({
  id: `task-${index}`,
  title,
  priority,
  estimate,
  completed: false,
}));

const defaultPlannerSuggestion =
  "Rearrange tasks by interview impact, finish DSA before lower-priority applications, and reserve 20 minutes for reflection.";

const roadmapPlans = {
  "MERN Developer": [
    ["Week 1", "JavaScript depth, Git workflow, API basics"],
    ["Week 2", "React patterns, forms, routing, component tests"],
    ["Week 3", "Node.js, Express, JWT auth, MongoDB models"],
    ["Week 4", "Full-stack project, deployment, interview revision"],
  ],
  "Frontend Developer": [
    ["Week 1", "HTML semantics, CSS layout, responsive systems"],
    ["Week 2", "React state, hooks, accessibility, Tailwind"],
    ["Week 3", "Performance, testing, UI architecture"],
    ["Week 4", "Portfolio polish and frontend interview drills"],
  ],
  "Backend Developer": [
    ["Week 1", "Node.js internals, REST, validation"],
    ["Week 2", "MongoDB indexing, caching, auth, security"],
    ["Week 3", "System design basics and cloud deployment"],
    ["Week 4", "API project, docs, backend interview prep"],
  ],
  "Full Stack Developer": [
    ["Week 1", "React plus API integration project sprint"],
    ["Week 2", "Auth, database design, protected dashboards"],
    ["Week 3", "Testing, CI, performance, deployment"],
    ["Week 4", "Mock interviews and project storytelling"],
  ],
};

const roadmapProgressValues = [86, 52, 24, 8];
const roadmapCheckpoints = [
  "Core notes ready",
  "Practice sprint active",
  "Project proof next",
  "Mock review queue",
];

const kanbanColumns = [
  ["Applied", "bg-sky-400", ["TCS Ninja", "Zoho Developer", "Infosys Specialist"]],
  ["Assessment", "bg-amber-300", ["Accenture ASE", "Wipro Elite"]],
  ["Interview Scheduled", "bg-violet-400", ["Freshworks Intern", "Cognizant GenC"]],
  ["Rejected", "bg-rose-400", ["CloudNova Trainee"]],
  ["Selected", "bg-emerald-400", ["PixelStack SDE"]],
];

const badges = [
  ["DSA Sprinter", "Solved 50+ problems", Trophy],
  ["SQL Sharp", "Optimized 20 queries", Database],
  ["Voice Builder", "7 speaking sessions", Mic2],
  ["Resume Ready", "ATS score above 85", ShieldCheck],
];

const leaderboard = [
  ["Anika", 7240],
  ["Sonam", 6980],
  ["Ritvik", 6515],
  ["Maya", 6180],
];

const priorityStyles = {
  High: "border-rose-400/40 bg-rose-500/[0.15] text-rose-700 dark:text-rose-100",
  Medium: "border-amber-300/40 bg-amber-400/[0.15] text-amber-700 dark:text-amber-100",
  Low: "border-emerald-300/40 bg-emerald-400/[0.15] text-emerald-700 dark:text-emerald-100",
};

const normalizePlannerItems = (items, fallback, prefix) =>
  (Array.isArray(items) ? items : fallback).map((item, index) => ({
    id: item.id || `${prefix}-${index}`,
    title: item.title || "",
    priority: priorityStyles[item.priority] ? item.priority : "Medium",
    estimate: item.estimate || "25 min",
    completed: Boolean(item.completed),
  }));

const getEstimateMinutes = (estimate = "") => {
  const minutes = Number.parseInt(String(estimate), 10);

  return Number.isFinite(minutes) ? minutes : 0;
};

const formatTenScore = (value, fallback = 1) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.min(10, Math.round(numericValue)));
};

const getOverallCoachScore = (result) => {
  const scoreValues = [
    result?.grammarScore,
    result?.vocabularyScore,
    result?.fluencyScore,
    result?.confidenceScore,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (Number.isFinite(Number(result?.overallScore))) {
    return formatTenScore(result.overallScore);
  }

  if (!scoreValues.length) {
    return 1;
  }

  return formatTenScore(
    scoreValues.reduce((total, value) => total + value, 0) / scoreValues.length,
  );
};

function GlassCard({ children, className = "", id }) {
  return (
    <section id={id} className={`glass-card ${className}`}>
      {children}
    </section>
  );
}

function IconBadge({ icon: Icon, className = "", label }) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/10 shadow-soft-panel backdrop-blur ${className}`}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          {eyebrow}
        </p>
        <h2 className="text-xl font-black text-slate-950 dark:text-paper sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function ProgressBar({ value, total = 100, color = "from-violet-500 to-fuchsia-500" }) {
  const width = Math.min(100, Math.round((value / total) * 100));

  return (
    <div className="mt-4 h-2.5 rounded-full bg-slate-900/10 p-0.5 dark:bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${width}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function CodeEditor({ title = "solution.js", children, className = "" }) {
  return (
    <div className={`code-editor ${className}`}>
      <div className="code-editor-top">
        <span />
        <span />
        <span />
        <p>{title}</p>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

function AppShell({ theme, setTheme, notificationsOpen, setNotificationsOpen, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-slate-100 text-slate-950 transition-colors duration-500 dark:bg-ink dark:text-paper">
        <div className="aurora-bg" />
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/70 bg-white/80 p-5 shadow-soft-panel backdrop-blur-2xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/80 lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-glow"
                style={{ background: primaryGradient }}
              >
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">PrepMate AI</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Placement OS
                </p>
              </div>
            </div>
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-500/[0.16] text-violet-700 ring-1 ring-violet-400/30 dark:text-violet-100"
                      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <GlassCard className="mt-auto p-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={Sparkles} className="text-violet-200" />
              <div>
                <p className="text-sm font-semibold">AI Focus Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  3 priority tasks queued
                </p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] dark:bg-white dark:text-slate-950">
              Start deep work
            </button>
          </GlassCard>
        </aside>

        {mobileOpen ? (
          <button
            className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="relative z-10 lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-100/80 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0F172A]/80 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-400 md:flex">
                <Search className="mr-3 h-4 w-4" />
                Search DSA, SQL, company prep, resume feedback...
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden rounded-lg border border-violet-300/30 bg-violet-500/[0.12] px-4 py-2 text-sm font-semibold text-violet-700 dark:text-violet-100 sm:block">
                  6,980 XP
                </div>
                <div className="relative">
                  <button
                    className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
                    aria-label="Notifications"
                    onClick={() => setNotificationsOpen((value) => !value)}
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
                  {notificationsOpen ? <NotificationPanel /> : null}
                </div>
                <button
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {children}
        </div>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-lg border border-white/10 bg-slate-950/90 p-1 shadow-glow backdrop-blur-2xl lg:hidden">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] font-bold transition hover:bg-white/10 hover:text-white ${
                  isActive ? "bg-white/10 text-white" : "text-slate-300"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function NotificationPanel() {
  const notifications = [
    ["Mock interview", "Technical round starts in 35 minutes."],
    ["Resume analyzer", "ATS score improved by 9 points."],
    ["Roadmap", "React hooks checkpoint unlocked."],
  ];

  return (
    <GlassCard className="absolute right-0 top-14 w-80 p-4">
      <p className="mb-3 text-sm font-semibold">Notification Center</p>
      <div className="space-y-3">
        {notifications.map(([title, body]) => (
          <div
            key={title}
            className="rounded-lg border border-white/10 bg-white/10 p-3"
          >
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {body}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function HeroSection() {
  const floating = [
    { label: "DSA", icon: Code2, className: "left-2 top-8", delay: 0 },
    { label: "SQL", icon: Database, className: "right-10 top-14", delay: 0.4 },
    { label: "AI", icon: BrainCircuit, className: "left-8 bottom-14", delay: 0.8 },
    { label: "Interview", icon: MessageCircle, className: "right-10 bottom-8", delay: 1.1 },
    { label: "Communication", icon: Mic2, className: "left-1/2 top-1 -translate-x-1/2", delay: 1.5 },
  ];

  return (
    <section id="dashboard" className="px-3 py-4 sm:px-6 lg:px-8 lg:py-8">
      <GlassCard className="relative w-full max-w-[calc(100vw-1.5rem)] overflow-hidden p-4 sm:max-w-none sm:p-7 lg:p-8">
        <div className="absolute inset-0 hero-mesh opacity-80" />
        <div className="relative grid min-w-0 grid-cols-1 items-center gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:gap-8">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/[0.14] px-3 py-2 text-xs font-semibold text-violet-700 dark:text-violet-100 sm:mb-5 sm:px-4 sm:text-sm">
              <Sparkles className="h-4 w-4" />
              AI-powered placement preparation
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl text-[2rem] font-black leading-[1.12] text-slate-950 dark:text-paper sm:text-5xl lg:text-6xl"
            >
              Your Personal AI Placement Mentor
            </motion.h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">
              Master DSA, SQL, Communication Skills, Interviews, Projects, and
              Productivity with AI.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row">
              <Link
                to="/dsa"
                className="group inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 sm:w-auto"
                style={{ background: primaryGradient }}
              >
                <Play className="mr-2 h-5 w-5 fill-white/20" />
                Start Learning
                <ChevronRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/ai-mentor"
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/80 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 dark:border-white/[0.12] dark:bg-white/10 dark:text-white sm:w-auto"
              >
                <Bot className="mr-2 h-5 w-5 text-violet-400" />
                Talk to AI Mentor
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
              {[
                ["Placement Readiness", "82%", TrendingUp],
                ["Daily Focus", "4h 10m", Timer],
                ["Open Goals", "12", Target],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.08] sm:p-4"
                >
                  <Icon className="mb-2 h-4 w-4 text-violet-400 sm:mb-3 sm:h-5 sm:w-5" />
                  <p className="text-xl font-black sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[220px] min-w-0 overflow-hidden sm:min-h-[320px] sm:overflow-visible xl:min-h-[360px]">
            <div className="hero-illustration mx-auto">
              <motion.div
                className="student-orbit"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="student-card"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
              >
                <div className="student-head" />
                <div className="student-body">
                  <div className="student-scarf" />
                </div>
                <div className="laptop">
                  <div className="laptop-screen">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="laptop-base" />
                </div>
                <div className="notes-panel">
                  <div />
                  <div />
                  <div />
                </div>
              </motion.div>
              {floating.map((item) => (
                <motion.div
                  key={item.label}
                  className={`floating-chip absolute ${item.className}`}
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item.delay,
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

function ProgressDashboard() {
  return (
    <section className="px-4 pb-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.9fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Welcome Card
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Good Morning, Sonam {"\u{1F44B}"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Your AI mentor has balanced today across problem solving,
                communication, applications, and project depth.
              </p>
            </div>
            <IconBadge icon={Rocket} className="text-amber-200" />
          </div>
          <div className="mt-6 rounded-lg border border-white/10 bg-slate-950 p-5 text-white shadow-glow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-violet-100">Daily Motivation</p>
              <Sparkles className="h-5 w-5 text-violet-200" />
            </div>
            <p className="mt-4 text-xl font-bold leading-8">
              Small consistent wins beat last-minute pressure.
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
          {progressStats.map(([label, value, total, caption, Icon, color]) => (
            <Link
              key={label}
              to={progressRoutes[label]}
              className="block h-full text-current no-underline"
            >
              <GlassCard className="h-full p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <IconBadge icon={Icon} className="text-violet-200" />
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold leading-4 text-slate-500 dark:text-slate-300 sm:px-3 sm:text-xs">
                    {caption}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-sm">
                  {label}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-black sm:text-3xl">{value}</span>
                  <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                    / {total}
                  </span>
                </div>
                <ProgressBar value={value} total={total} color={color} />
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunicationCoach() {
  const defaultStarter = {
    topic:
      "Explain React Hooks to an interviewer. Cover why hooks are used, one hook you know well, and one project example.",
    dailyTarget:
      "Understand React Hooks: state, side effects, and reusable logic in function components. Prepare one interview answer with a definition, one project use, and one result.",
    dailyTechnology: {
      name: "React Hooks",
      focus: "state, side effects, and reusable logic in function components",
      keyPoints: [
        "Hooks let function components manage state and side effects.",
        "useState stores UI state; useEffect runs side-effect logic after render.",
        "Custom hooks help reuse component logic cleanly.",
      ],
    },
    vocabularyWord: {
      word: "impact",
      meaning: "a measurable effect or result",
      example: "My project created impact by reducing manual tracking time.",
    },
    motivationQuote: "Every polished answer starts as one honest attempt.",
  };
  const createChatId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createQuestionMessage = (payload) => ({
    id: createChatId(),
    role: "assistant",
    type: "question",
    starter: payload,
  });
  const [starter, setStarter] = useState(defaultStarter);
  const [chatMessages, setChatMessages] = useState([
    createQuestionMessage(defaultStarter),
  ]);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const [speakingKey, setSpeakingKey] = useState("");
  const [microphones, setMicrophones] = useState([]);
  const [selectedMicId, setSelectedMicId] = useState("");
  const [micError, setMicError] = useState("");
  const [communicationModels, setCommunicationModels] = useState(
    fallbackCommunicationModels,
  );
  const [selectedModel, setSelectedModel] = useState(getStoredCommunicationModel);
  const [modelError, setModelError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);

  const selectedModelDetails = useMemo(
    () =>
      communicationModels.find((modelOption) => modelOption.id === selectedModel) ||
      communicationModels[0] ||
      fallbackCommunicationModels[0],
    [communicationModels, selectedModel],
  );

  const isAudioRecordingSupported = () =>
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.mediaDevices?.getUserMedia &&
    navigator.mediaDevices?.enumerateDevices &&
    window.MediaRecorder;

  const stopActiveStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;

    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const getRecorderMimeType = () => {
    if (
      typeof window === "undefined" ||
      !window.MediaRecorder?.isTypeSupported
    ) {
      return "";
    }

    return (
      [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => window.MediaRecorder.isTypeSupported(type)) || ""
    );
  };

  const refreshMicrophones = async ({ requestPermission = false } = {}) => {
    if (!isAudioRecordingSupported()) {
      setMicError("Microphone recording is not supported in this browser.");
      return;
    }

    let permissionStream;

    try {
      setMicError("");

      if (requestPermission) {
        permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((device) => device.kind === "audioinput");

      setMicrophones(audioInputs);
      setSelectedMicId((current) =>
        current && audioInputs.some((device) => device.deviceId === current)
          ? current
          : audioInputs[0]?.deviceId || "",
      );

      if (!audioInputs.length) {
        setMicError("No microphone input was found.");
      }
    } catch (error) {
      setMicError(
        error?.name === "NotAllowedError"
          ? "Microphone permission was blocked."
          : "Could not access microphone inputs.",
      );
    } finally {
      permissionStream?.getTracks().forEach((track) => track.stop());
    }
  };

  const transcribeRecording = async (audioBlob) => {
    setTranscribing(true);
    setCoachError("");
    setMicError("");

    try {
      const result = await communicationApi.transcribe(audioBlob, {
        topic: starter.topic,
      });
      const transcript = String(result.text || "").trim();

      if (!transcript) {
        setMicError(
          result.message || "I could not hear speech clearly. Try recording again.",
        );
        return;
      }

      setMessage((current) =>
        current.trim() ? `${current.trim()}\n\n${transcript}` : transcript,
      );
    } catch (error) {
      setMicError(error.message);
    } finally {
      setTranscribing(false);
    }
  };

  const stopVoiceAnswer = () => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.stop();
      return;
    }

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startBrowserSpeechAnswer = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      return false;
    }

    let finalTranscript = "";
    let endedWithError = false;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let nextFinal = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];

        if (result.isFinal) {
          nextFinal += result[0].transcript;
        }
      }

      if (nextFinal.trim()) {
        finalTranscript = `${finalTranscript} ${nextFinal}`.trim();
      }
    };

    recognition.onerror = (event) => {
      endedWithError = true;
      const blocked = event.error === "not-allowed" || event.error === "service-not-allowed";

      setMicError(
        blocked
          ? "Microphone permission was blocked."
          : "Speech recognition stopped. Try speaking again.",
      );
      setRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setRecording(false);

      const transcript = finalTranscript.trim();

      if (transcript) {
        setMicError("");
        setMessage((current) =>
          current.trim() ? `${current.trim()}\n\n${transcript}` : transcript,
        );
      } else if (!endedWithError) {
        setMicError("I could not hear speech clearly. Try speaking again.");
      }
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
      return true;
    } catch {
      recognitionRef.current = null;
      setRecording(false);
      setMicError("Could not start speech recognition in this browser.");
      return true;
    }
  };

  const startVoiceAnswer = async () => {
    if (recording) {
      stopVoiceAnswer();
      return;
    }

    setCoachError("");
    setMicError("");

    if (startBrowserSpeechAnswer()) {
      return;
    }

    if (!isAudioRecordingSupported()) {
      setMicError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      audioChunksRef.current = [];

      const audioConstraint = selectedMicId
        ? {
            deviceId: { exact: selectedMicId },
            echoCancellation: true,
            noiseSuppression: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
          };
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraint,
      });
      const mimeType = getRecorderMimeType();
      const recorder = new window.MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setMicError("Recording failed. Try another microphone.");
        stopActiveStream();
        setRecording(false);
      };

      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        stopActiveStream();
        setRecording(false);

        if (!chunks.length) {
          setMicError("I did not catch any audio. Try again.");
          return;
        }

        const audioBlob = new Blob(chunks, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });

        if (audioBlob.size < 1024) {
          setMicError("I did not catch enough audio. Try again.");
          return;
        }

        transcribeRecording(audioBlob);
      };

      recorder.start();
      setRecording(true);
      refreshMicrophones();
    } catch (error) {
      stopActiveStream();
      setRecording(false);
      setMicError(
        error?.name === "NotAllowedError"
          ? "Microphone permission was blocked."
          : "Could not start recording from that microphone.",
      );
    }
  };

  const loadRandomQuestion = async ({ replace = false } = {}) => {
    setQuestionLoading(true);
    setCoachError("");
    setMicError("");

    try {
      const topicPayload = await communicationApi.startTopic();
      const questionMessage = createQuestionMessage(topicPayload);

      setStarter(topicPayload);
      setAnalysis(null);
      setMessage("");
      setChatMessages((current) =>
        replace ? [questionMessage] : [...current, questionMessage],
      );
    } catch (error) {
      setCoachError(error.message);
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadCoach = async () => {
      try {
        const topicPayload = await communicationApi.startTopic();

        if (!active) return;
        setStarter(topicPayload);
        setChatMessages([createQuestionMessage(topicPayload)]);
      } catch (error) {
        if (!active) return;
        setCoachError(error.message);
      }
    };

    loadCoach();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadModels = async () => {
      try {
        const payload = await communicationApi.models();
        const nextModels = Array.isArray(payload.communicationModels)
          ? payload.communicationModels.filter((modelOption) => modelOption?.id)
          : fallbackCommunicationModels;

        if (!active) return;

        const usableModels = nextModels.length
          ? nextModels
          : fallbackCommunicationModels;
        const defaultModel =
          payload.defaultCommunicationModel ||
          usableModels.find((modelOption) => modelOption.default)?.id ||
          usableModels[0].id;

        setCommunicationModels(usableModels);
        setSelectedModel((current) =>
          usableModels.some((modelOption) => modelOption.id === current)
            ? current
            : defaultModel,
        );
        setModelError("");
      } catch (error) {
        if (!active) return;
        setModelError(error.message);
      }
    };

    loadModels();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedModel) {
      return;
    }

    window.localStorage.setItem(COMMUNICATION_MODEL_KEY, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, loading, questionLoading, transcribing]);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return undefined;
    }

    let active = true;
    const syncMicrophones = async () => {
      if (!active) return;
      await refreshMicrophones();
    };

    syncMicrophones();
    navigator.mediaDevices.addEventListener?.("devicechange", syncMicrophones);

    return () => {
      active = false;
      navigator.mediaDevices.removeEventListener?.("devicechange", syncMicrophones);
    };
  }, []);

  useEffect(() => {
    if (!recording) {
      setRecordingSeconds(0);
      return undefined;
    }

    setRecordingSeconds(0);
    const timer = window.setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const recognition = recognitionRef.current;

      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      }

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      stopActiveStream();
    };
  }, []);

  const analyzeAnswer = async () => {
    const answer = message.trim();

    if (!answer) return;

    const activeStarter = starter;
    setLoading(true);
    setCoachError("");
    setMicError("");
    setAnalysis(null);
    setMessage("");
    setChatMessages((current) => [
      ...current,
      {
        id: createChatId(),
        role: "user",
        type: "answer",
        text: answer,
      },
    ]);

    try {
      const result = await communicationApi.analyze({
        message: answer,
        topic: activeStarter.topic,
        model: selectedModel,
      });
      const enrichedResult = {
        dailyTarget: activeStarter.dailyTarget,
        dailyTechnology: activeStarter.dailyTechnology,
        ...result,
      };

      setAnalysis(enrichedResult);
      setChatMessages((current) => [
        ...current,
        {
          id: createChatId(),
          role: "assistant",
          type: "feedback",
          analysis: enrichedResult,
        },
      ]);
    } catch (error) {
      setCoachError(error.message);
      setChatMessages((current) => [
        ...current,
        {
          id: createChatId(),
          role: "assistant",
          type: "error",
          text: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (key, text) => {
    const speechText = String(text || "").trim();

    if (
      !speechText ||
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      !window.SpeechSynthesisUtterance
    ) {
      return;
    }

    if (speakingKey === key) {
      window.speechSynthesis.cancel();
      setSpeakingKey("");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(speechText);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingKey("");
    utterance.onerror = () => setSpeakingKey("");

    setSpeakingKey(key);
    window.speechSynthesis.speak(utterance);
  };

  const getQuestionText = (questionStarter) =>
    [
      questionStarter?.dailyTechnology?.name
        ? `Today's technology: ${questionStarter.dailyTechnology.name}.`
        : "",
      questionStarter?.dailyTarget ? `Daily target: ${questionStarter.dailyTarget}` : "",
      questionStarter?.topic || "",
      Array.isArray(questionStarter?.dailyTechnology?.keyPoints)
        ? `Key points: ${questionStarter.dailyTechnology.keyPoints.join(" ")}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  const getCoachResponse = (result) => {
    if (!result) return "";

    const overallScore = getOverallCoachScore(result);
    const vocabularySuggestions =
      result.betterVocabularySuggestions?.filter(Boolean).join(", ") || "";
    const mistakes = result.mistakes?.filter(Boolean).join(" ") || "";

    return [
      `Overall score: ${overallScore} out of 10.`,
      result.betterInterviewAnswer
        ? `Better interview answer: ${result.betterInterviewAnswer}`
        : "",
      `Corrected answer: ${result.correctedMessage}`,
      `Feedback: ${result.feedback}`,
      mistakes ? `Grammar notes: ${mistakes}` : "",
      vocabularySuggestions ? `Better vocabulary: ${vocabularySuggestions}` : "",
      result.improvementTip ? `Tip: ${result.improvementTip}` : "",
      result.followUpQuestion ? `Follow-up question: ${result.followUpQuestion}` : "",
      `Scores: Grammar ${formatTenScore(result.grammarScore)}/10, Vocabulary ${formatTenScore(result.vocabularyScore)}/10, Fluency ${formatTenScore(result.fluencyScore)}/10, Confidence ${formatTenScore(result.confidenceScore)}/10.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  };
  const answerStatus = micError || coachError || modelError;
  const answerMeta = transcribing
    ? "Transcribing answer..."
    : recording
      ? `Recording ${recordingSeconds}s`
      : `${message.trim().length} characters | ${selectedModelDetails.label}`;

  const renderSpeakerButton = (key, text, disabled = false) => (
    <button
      type="button"
      onClick={() => speakText(key, text)}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        speakingKey === key
          ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-700 dark:text-emerald-100"
          : "border-white/10 bg-white/10 text-slate-700 hover:bg-white/15 dark:text-slate-200"
      } disabled:cursor-not-allowed disabled:opacity-45`}
      aria-label={speakingKey === key ? "Stop reading" : "Read aloud"}
      title={speakingKey === key ? "Stop reading" : "Read aloud"}
    >
      <Volume2 className="h-4 w-4" />
    </button>
  );

  const renderQuestionBubble = (item) => {
    const questionStarter = item.starter || starter;
    const speechText = getQuestionText(questionStarter);
    const dailyTechnology = questionStarter.dailyTechnology;
    const keyPoints = Array.isArray(dailyTechnology?.keyPoints)
      ? dailyTechnology.keyPoints
      : [];

    return (
      <>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
              Today's Technology
            </p>
            <p className="mt-1 truncate text-lg font-black text-slate-950 dark:text-white">
              {dailyTechnology?.name || "Technology Interview Practice"}
            </p>
          </div>
          {renderSpeakerButton(item.id, speechText)}
        </div>
        {dailyTechnology?.focus ? (
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {dailyTechnology.focus}
          </p>
        ) : null}
        {questionStarter.dailyTarget ? (
          <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-400/[0.12] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
              Daily Target
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-100">
              {questionStarter.dailyTarget}
            </p>
          </div>
        ) : null}
        <p className="mt-4 text-base font-semibold leading-7 text-slate-950 dark:text-white">
          {questionStarter.topic}
        </p>
        {keyPoints.length ? (
          <div className="mt-4 grid gap-2">
            {keyPoints.map((point) => (
              <div
                key={point}
                className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-xs leading-5 text-slate-600 dark:text-slate-300"
              >
                {point}
              </div>
            ))}
          </div>
        ) : null}
      </>
    );
  };

  const renderFeedbackBubble = (item) => {
    const result = item.analysis;
    const speechText = getCoachResponse(result);
    const overallScore = getOverallCoachScore(result);
    const scores = [
      ["Grammar", formatTenScore(result.grammarScore)],
      ["Vocabulary", formatTenScore(result.vocabularyScore)],
      ["Fluency", formatTenScore(result.fluencyScore)],
      ["Confidence", formatTenScore(result.confidenceScore)],
    ];
    const improvementGroups = [
      ["Mistakes", result.mistakes],
      ["Better Words", result.betterVocabularySuggestions],
      ["Practice", result.recommendations],
    ]
      .map(([label, items]) => [
        label,
        Array.isArray(items) ? items.filter(Boolean) : [],
      ])
      .filter(([, items]) => items.length);

    const betterInterviewAnswer =
      result.betterInterviewAnswer || result.correctedMessage || "";
    const dailyTechnologyName = result.dailyTechnology?.name;

    const answerBlocks = [
      ["Better Interview Answer", betterInterviewAnswer],
      ["Corrected Answer", result.correctedMessage],
    ];

    return (
      <>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-200">
              Feedback
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
              {overallScore}/10
            </p>
          </div>
          <div className="flex items-center gap-2">
            {result.aiModel ? (
              <span className="rounded-lg border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-300">
                {result.aiModel}
              </span>
            ) : null}
            {renderSpeakerButton(item.id, speechText)}
          </div>
        </div>
        {dailyTechnologyName ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
            {dailyTechnologyName}
          </p>
        ) : null}
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {result.feedback}
        </p>
        {result.dailyTarget ? (
          <p className="mt-3 rounded-lg border border-emerald-300/20 bg-emerald-400/[0.12] p-3 text-sm leading-6 text-slate-700 dark:text-slate-100">
            Target: {result.dailyTarget}
          </p>
        ) : null}
        {answerBlocks.map(([title, text]) =>
          text ? (
            <div
              key={title}
              className="mt-4 rounded-lg border border-white/10 bg-white/[0.08] p-3"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                {title}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-100">
                {text}
              </p>
            </div>
          ) : null,
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scores.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.08] p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-lg font-black">{value}/10</p>
            </div>
          ))}
        </div>
        {improvementGroups.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {improvementGroups.map(([label, items]) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/[0.08] p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                  {label}
                </p>
                <div className="mt-2 space-y-2">
                  {items.slice(0, 3).map((entry) => (
                    <p
                      key={entry}
                      className="text-xs leading-5 text-slate-600 dark:text-slate-300"
                    >
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {result.improvementTip ? (
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Tip: {result.improvementTip}
          </p>
        ) : null}
        {result.followUpQuestion ? (
          <p className="mt-3 text-sm font-semibold leading-6 text-violet-700 dark:text-violet-100">
            Follow-up: {result.followUpQuestion}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <GlassCard id="communication" className="overflow-hidden p-0">
      <div className="border-b border-white/10 bg-slate-950/90 p-4 text-white sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-black sm:text-2xl">
              Communication Chat
            </h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white"
              title={selectedModelDetails.description || selectedModelDetails.label}
            >
              <Cpu className="h-4 w-4 shrink-0 text-violet-200" />
              <span className="sr-only">AI model</span>
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
                disabled={loading || recording || transcribing}
                className="min-w-0 bg-transparent text-sm font-bold text-white outline-none disabled:cursor-not-allowed"
                aria-label="AI model"
              >
                {communicationModels.map((modelOption) => (
                  <option
                    key={modelOption.id}
                    value={modelOption.id}
                    className="bg-slate-950 text-white"
                  >
                    {modelOption.label || modelOption.id}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => loadRandomQuestion()}
              disabled={questionLoading || recording || transcribing}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="mr-2 h-4 w-4" />
              {questionLoading ? "Loading..." : "Next Tech Question"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[min(76vh,760px)] min-h-[620px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {chatMessages.map((item) => {
            const isUser = item.role === "user";

            return (
              <div
                key={item.id}
                className={`flex items-start ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`min-w-0 max-w-[92%] rounded-lg p-4 sm:max-w-[78%] ${
                    isUser
                      ? "bg-violet-500 text-white"
                      : item.type === "error"
                        ? "border border-rose-400/30 bg-rose-500/[0.14] text-rose-900 dark:text-rose-100"
                        : "border border-white/10 bg-white/[0.08]"
                  }`}
                >
                  {item.type === "question" ? renderQuestionBubble(item) : null}
                  {item.type === "answer" ? (
                    <p className="whitespace-pre-line text-sm leading-7">
                      {item.text}
                    </p>
                  ) : null}
                  {item.type === "feedback" ? renderFeedbackBubble(item) : null}
                  {item.type === "error" ? (
                    <p className="text-sm leading-6">{item.text}</p>
                  ) : null}
                </div>
              </div>
            );
          })}

          {loading ? (
            <div className="flex items-start">
              <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm text-slate-600 dark:text-slate-300">
                Reviewing your answer...
              </div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-white/10 bg-white/[0.06] p-4 sm:p-5">
          <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-white/[0.08] p-2">
            <textarea
              className="max-h-40 min-h-16 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 outline-none dark:text-white"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  analyzeAnswer();
                }
              }}
              placeholder="Type your answer or use the mic"
            />
            <button
              type="button"
              onClick={recording ? stopVoiceAnswer : startVoiceAnswer}
              disabled={transcribing}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                recording ? "bg-rose-500 hover:bg-rose-400" : ""
              }`}
              style={recording ? undefined : { background: primaryGradient }}
              aria-label={recording ? "Stop speaking" : "Speak answer"}
              title={recording ? "Stop speaking" : "Speak answer"}
            >
              {recording ? (
                <Square className="h-5 w-5 fill-white/20" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: primaryGradient }}
              onClick={analyzeAnswer}
              disabled={loading || recording || transcribing || !message.trim()}
              aria-label="Send answer"
              title="Send answer"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {answerStatus ? (
              <p className="text-sm text-rose-500 dark:text-rose-200">
                {answerStatus}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {answerMeta}
              </p>
            )}
            {analysis ? (
              <button
                type="button"
                onClick={() => loadRandomQuestion()}
                disabled={questionLoading || recording || transcribing}
                className="inline-flex items-center justify-center rounded-lg border border-violet-300/30 bg-violet-500/[0.12] px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-500/[0.18] disabled:cursor-not-allowed disabled:opacity-60 dark:text-violet-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Next Tech Question
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function DsaHub({
  practice,
  loading = false,
  completingPractice = false,
  onCompletePractice,
  status = "",
}) {
  const [difficulty, setDifficulty] = useState("Medium");
  const problem = practice?.question || dsaProblems[difficulty];
  const activeDifficulty = problem?.difficulty || difficulty;
  const selectedDifficulty = practice?.question ? activeDifficulty : difficulty;
  const hintText =
    problem?.hints?.[0] || "Break the problem into state, transition, and edge cases.";
  const approachText =
    problem?.approach || "Write the brute-force idea first, then tighten the data structure.";
  const solutionText =
    problem?.solution ||
    `function solve(input) {
  const seen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < input.length; right++) {
    const char = input[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`;

  return (
    <GlassCard id="dsa" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <IconBadge icon={Code2} className="mb-4 text-violet-200" />
          <h3 className="text-2xl font-bold">DSA Practice Hub</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            LeetCode-style daily questions with AI hints, solutions, time
            complexity, and progress tracking.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-lg border border-white/10 bg-white/[0.08] p-1">
            {["Easy", "Medium", "Hard"].map((item) => (
              <button
                key={item}
                onClick={() => setDifficulty(item)}
                className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                  selectedDifficulty === item
                    ? "bg-white text-slate-950"
                    : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onCompletePractice}
            disabled={loading || completingPractice || practice?.completedToday}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              practice?.completedToday
                ? "bg-emerald-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {practice?.completedToday
              ? "Practiced Today"
              : completingPractice
                ? "Saving..."
                : "Mark Practiced"}
          </button>
        </div>
      </div>
      {status ? (
        <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-500/[0.08] p-3 text-sm font-semibold text-rose-600 dark:text-rose-100">
          {status}
        </div>
      ) : null}
      {loading ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.08] p-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
          Loading today's DSA practice...
        </div>
      ) : null}
      {!practice?.question ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {dsaTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold"
            >
              {topic}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950 p-5 text-white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-violet-200">Daily DSA Question</p>
            <span className="rounded-full bg-violet-500/25 px-3 py-1 text-xs font-bold">
              {activeDifficulty}
            </span>
          </div>
          <h4 className="text-xl font-black">{problem.title}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{problem.prompt}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Hint", hintText],
              ["Approach", approachText],
              ["Time Complexity", problem.time],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <CodeEditor title="solution.js">{solutionText}</CodeEditor>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Acceptance", problem.acceptance || "Practice"],
          ["Today", practice?.completedToday ? "Done" : "Pending"],
          ["Current Streak", `${practice?.currentStreak || 0} days`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function SqlArena() {
  const [query, setQuery] = useState(
    "SELECT s.name, s.branch, COUNT(a.id) AS applications\nFROM students s\nJOIN applications a ON a.student_id = s.id\nWHERE a.status IN ('Assessment', 'Interview')\nGROUP BY s.id, s.name, s.branch\nORDER BY applications DESC;",
  );

  return (
    <GlassCard id="sql" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={Database} className="mb-4 text-cyan-200" />
          <h3 className="text-2xl font-bold">SQL Practice Arena</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Daily SQL challenges with schema visualization, query execution,
            correction, optimization, and result explanations.
          </p>
        </div>
        <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-100">
          Daily Challenge
        </span>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-sm font-bold">SQL Editor UI</p>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-[305px] w-full resize-none rounded-lg border border-white/10 bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-100 outline-none focus:border-cyan-300"
          />
        </div>
        <div className="grid gap-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
            <p className="text-sm font-bold">Database Schema Visualizer</p>
            <div className="mt-4 grid gap-3">
              {sqlSchema.map((table) => (
                <div key={table.table} className="rounded-lg bg-slate-950/80 p-3 text-white">
                  <p className="text-sm font-black">{table.table}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {table.fields.map((field) => (
                      <span key={field} className="rounded-full bg-white/10 px-2 py-1 text-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Query Correction", "GROUP BY includes all selected fields."],
              ["Optimization", "Index applications.student_id."],
              ["Result Explanation", "Ranks students by active applications."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                <p className="text-xs font-bold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function InterviewPrep() {
  const [tab, setTab] = useState("HR");
  const data = interviewData[tab];

  return (
    <GlassCard id="interviews" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={MessageSquareText} className="mb-4 text-rose-200" />
          <h3 className="text-2xl font-bold">AI Interview Preparation</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Mock rounds, communication rating, AI feedback, and targeted
            improvement suggestions.
          </p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/[0.08] p-1">
          {Object.keys(interviewData).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-md px-4 py-2 text-sm font-bold ${
                tab === item ? "bg-white text-slate-950" : "text-slate-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950 p-5 text-white">
          <p className="text-sm text-violet-200">{data.title}</p>
          <p className="mt-3 text-6xl font-black">{data.score}</p>
          <p className="mt-2 text-sm text-slate-300">Communication Rating</p>
          <ProgressBar value={data.score} color="from-violet-500 to-fuchsia-500" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Mock Interview", data.prompts.join(" | ")],
            ["AI Feedback", data.feedback],
            ["Communication Rating", data.rating],
            ["Improvement Suggestions", "Use STAR, add metrics, and keep answers concise."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function PlannerAndTodo() {
  const [goals, setGoals] = useState(defaultPlannerGoals);
  const [tasks, setTasks] = useState(defaultPlannerTasks);
  const [taskText, setTaskText] = useState("Apply to 2 internships");
  const [suggestion, setSuggestion] = useState(defaultPlannerSuggestion);
  const [plannerPersisted, setPlannerPersisted] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(true);
  const [plannerNotice, setPlannerNotice] = useState("");

  const syncPlanner = (planner) => {
    setGoals(normalizePlannerItems(planner.goals, defaultPlannerGoals, "goal"));
    setTasks(normalizePlannerItems(planner.tasks, defaultPlannerTasks, "task"));
    setSuggestion(planner.suggestion || defaultPlannerSuggestion);
    setPlannerPersisted(planner.saved !== false);
    setPlannerNotice(
      planner.saved === false
        ? "Planner is running locally until MongoDB connects."
        : "",
    );
  };

  useEffect(() => {
    let active = true;

    const loadPlanner = async () => {
      setPlannerLoading(true);

      try {
        const planner = await plannerApi.today();

        if (active) {
          syncPlanner(planner);
        }
      } catch (error) {
        if (active) {
          setPlannerPersisted(false);
          setPlannerNotice(error.message || "Planner is running locally for now.");
        }
      } finally {
        if (active) {
          setPlannerLoading(false);
        }
      }
    };

    loadPlanner();

    return () => {
      active = false;
    };
  }, []);

  const savePlannerChange = async (request) => {
    if (!plannerPersisted) return;

    try {
      const planner = await request();
      syncPlanner(planner);
    } catch (error) {
      setPlannerPersisted(false);
      setPlannerNotice(error.message || "Planner changes are local until MongoDB reconnects.");
    }
  };

  const toggleGoal = (goal) => {
    const completed = !goal.completed;

    setGoals((current) =>
      current.map((item) => (item.id === goal.id ? { ...item, completed } : item)),
    );

    savePlannerChange(() => plannerApi.updateGoal(goal.id, { completed }));
  };

  const addTask = () => {
    const title = taskText.trim();

    if (!title) return;

    const task = {
      id: `local-task-${Date.now()}`,
      title,
      priority: "Medium",
      estimate: "25 min",
      completed: false,
    };

    setTasks((current) => [...current, task]);
    setTaskText("");
    savePlannerChange(() =>
      plannerApi.addTask({
        title: task.title,
        priority: task.priority,
        estimate: task.estimate,
        completed: task.completed,
      }),
    );
  };

  const toggleTask = (task) => {
    const completed = !task.completed;

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, completed } : item)),
    );

    savePlannerChange(() => plannerApi.updateTask(task.id, { completed }));
  };

  const deleteTask = (task) => {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    savePlannerChange(() => plannerApi.deleteTask(task.id));
  };

  const plannerItems = [...goals, ...tasks];
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completedItems = completedGoals + completedTasks;
  const totalItems = plannerItems.length;
  const completionRate = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;
  const plannedMinutes = plannerItems.reduce(
    (total, item) => total + getEstimateMinutes(item.estimate),
    0,
  );
  const remainingHighPriority = plannerItems.filter(
    (item) => item.priority === "High" && !item.completed,
  );
  const nextFocus =
    remainingHighPriority[0]?.title ||
    plannerItems.find((item) => !item.completed)?.title ||
    "Review progress and pick the next stretch task";
  const planStats = [
    ["Progress", `${completionRate}%`, `${completedItems}/${totalItems} done`, Target, "text-emerald-300"],
    ["Planned Time", `${plannedMinutes} min`, "Across goals and tasks", Timer, "text-cyan-300"],
    ["Goal Wins", `${completedGoals}/${goals.length}`, "Daily targets closed", Trophy, "text-amber-300"],
    ["Task Queue", `${tasks.length}`, `${completedTasks} completed`, ListChecks, "text-violet-300"],
  ];

  return (
    <section id="planner" className="space-y-4">
      <GlassCard className="overflow-hidden">
        <div className="grid gap-px bg-slate-200/70 dark:bg-white/10 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-white/70 p-5 dark:bg-white/[0.06] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2"
                style={{
                  background: `conic-gradient(#22c55e ${
                    completionRate * 3.6
                  }deg, rgba(148, 163, 184, 0.24) 0deg)`,
                }}
                aria-label={`Planner progress ${completionRate}%`}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-slate-950 shadow-soft-panel dark:bg-slate-950 dark:text-paper">
                  <span className="text-3xl font-black">{completionRate}%</span>
                  <span className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    complete
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <IconBadge icon={CalendarCheck} className="mb-4 text-emerald-200" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                  Daily execution
                </p>
                <h3 className="mt-2 text-2xl font-bold">Today&apos;s Prep Plan</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Keep the day anchored around the highest-impact unfinished work.
                </p>
                <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-400/[0.12] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
                    Next focus
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6">{nextFocus}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-px bg-slate-200/70 dark:bg-white/10 sm:grid-cols-2">
            {planStats.map(([label, value, caption, Icon, color]) => (
              <div key={label} className="bg-white/70 p-4 dark:bg-white/[0.06] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="mt-3 text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <IconBadge icon={Target} className="mb-4 text-emerald-200" />
              <h3 className="text-2xl font-bold">Goal Checklist</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Main outcomes for the day, sorted by placement impact.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-400/[0.12] px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-100">
              {completedGoals}/{goals.length} closed
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {plannerLoading ? (
              <p className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm text-slate-500 dark:text-slate-400">
                Loading planner...
              </p>
            ) : null}
            {goals.map((goal) => (
              <label
                key={goal.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleGoal(goal)}
                    className="h-5 w-5 shrink-0 accent-violet-500"
                  />
                  <span
                    className={`min-w-0 flex-1 text-sm font-semibold ${
                      goal.completed ? "text-slate-400 line-through" : ""
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-8 sm:shrink-0 sm:pl-0">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityStyles[goal.priority]}`}>
                    {goal.priority}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {goal.estimate}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <IconBadge icon={ListChecks} className="mb-4 text-violet-200" />
              <h3 className="text-2xl font-bold">Task Queue</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Add quick tasks, close them as you work, and keep the list lean.
              </p>
            </div>
            <span className="w-fit rounded-full border border-violet-300/30 bg-violet-400/[0.12] px-4 py-2 text-xs font-black text-violet-700 dark:text-violet-100">
              {tasks.length} active
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addTask();
                }
              }}
              className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.08]"
              placeholder="Add task"
            />
            <button
              onClick={addTask}
              disabled={!taskText.trim()}
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: primaryGradient }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Task
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {tasks.length ? (
              tasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      className="h-5 w-5 shrink-0 accent-violet-500"
                      aria-label={`Complete ${task.title}`}
                    />
                    <Pencil className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                    <p
                      className={`min-w-0 flex-1 text-sm font-semibold ${
                        task.completed ? "text-slate-400 line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pl-8 sm:shrink-0 sm:pl-0">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {task.estimate}
                    </span>
                    <button
                      onClick={() => deleteTask(task)}
                      className="rounded-md bg-white/10 p-2 transition hover:bg-white/20"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm text-slate-500 dark:text-slate-400">
                No tasks yet. Add one focused action for the next study block.
              </p>
            )}
          </div>
          {plannerNotice ? (
            <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-400/[0.12] p-4 text-sm leading-6 text-amber-700 dark:text-amber-100">
              {plannerNotice}
            </div>
          ) : null}
          <div className="mt-4 rounded-lg border border-violet-300/20 bg-violet-400/[0.12] p-4 text-sm leading-6">
            <span className="font-bold">AI Suggestion:</span> {suggestion}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function RoadmapGenerator() {
  const [role, setRole] = useState("MERN Developer");
  const plan = roadmapPlans[role];
  const averageProgress = Math.round(
    roadmapProgressValues.reduce((total, value) => total + value, 0) /
      roadmapProgressValues.length,
  );
  const activeWeekIndex = roadmapProgressValues.findIndex((value) => value < 80);
  const activeWeek =
    activeWeekIndex === -1 ? plan[plan.length - 1][0] : plan[activeWeekIndex][0];

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={Map} className="mb-4 text-cyan-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
            Role roadmap
          </p>
          <h3 className="mt-2 text-2xl font-bold">Four-Week Prep Sprint</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Select a role and track the weekly learning path, checkpoint, and
            interview proof you should build next.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/[0.12] px-4 text-sm font-black text-cyan-700 dark:text-cyan-100">
            {activeWeek} active
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="min-h-12 rounded-lg border border-slate-200 bg-white/70 px-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/[0.08]"
          >
            {Object.keys(roadmapPlans).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["Sprint Progress", `${averageProgress}%`, TrendingUp],
          ["Current Role", role, Briefcase],
          ["Final Output", "Deployable project story", Rocket],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <Icon className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-3 text-sm font-black sm:text-base">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {plan.map(([week, detail], index) => (
          <div key={week} className="roadmap-step">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-violet-700 dark:text-violet-300">
                {week}
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-300">
                {roadmapProgressValues[index]}%
              </span>
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {detail}
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Checkpoint
              </p>
              <p className="mt-1 text-sm font-bold">{roadmapCheckpoints[index]}</p>
            </div>
            <ProgressBar value={roadmapProgressValues[index]} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ResumeAnalyzer() {
  return (
    <GlassCard id="career" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <IconBadge icon={FileText} className="mb-4 text-violet-200" />
          <h3 className="text-2xl font-bold">Resume Analyzer</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Upload a resume PDF and get ATS score, missing skills, suggestions,
            and improvement areas.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5">
          <UploadCloud className="mr-2 h-5 w-5 text-violet-300" />
          Upload Resume PDF
          <input type="file" accept="application/pdf" className="hidden" />
        </label>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950 p-5 text-white">
          <p className="text-sm text-violet-200">ATS Score</p>
          <div className="mx-auto mt-5 h-52 max-w-52">
            <Doughnut
              data={{
                labels: ["ATS", "Remaining"],
                datasets: [
                  {
                    data: [86, 14],
                    backgroundColor: ["#8B5CF6", "rgba(255,255,255,0.12)"],
                    borderWidth: 0,
                    cutout: "78%",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
              }}
            />
          </div>
          <p className="-mt-28 text-center text-5xl font-black">86</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Missing Skills", "Docker, Redis, CI/CD"],
            ["Resume Suggestions", "Add metrics to project bullets"],
            ["Improvement Areas", "ATS keywords and role alignment"],
          ].map(([title, value]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-5">
              <ClipboardCheck className="mb-4 h-6 w-6 text-violet-300" />
              <p className="font-bold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function JobTracker() {
  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <IconBadge icon={Briefcase} className="mb-4 text-amber-200" />
          <h3 className="text-2xl font-bold">Job Application Tracker</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Kanban-style hiring pipeline across applied, assessment, interview,
            rejected, and selected stages.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        {kanbanColumns.map(([title, color, jobs]) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <p className="font-bold">{title}</p>
            </div>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job}
                  className="rounded-lg border border-white/10 bg-white/10 p-3 text-sm font-semibold shadow-sm"
                >
                  {job}
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    AI follow-up ready
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function CompanyAndGithub() {
  const [company, setCompany] = useState("Google");
  const [repo, setRepo] = useState("github.com/sonam/prepmate-ai");

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={Building2} className="mb-4 text-cyan-200" />
        <h3 className="text-2xl font-bold">Company Preparation Assistant</h3>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.08]"
            placeholder="Enter company name"
          />
          <button className="rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ background: primaryGradient }}>
            Generate Prep
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Company Overview", `${company || "Company"} values scalable products and strong fundamentals.`],
            ["Interview Questions", "DSA, projects, system basics, behavioral rounds."],
            ["Required Skills", "React, SQL, problem solving, communication."],
            ["Hiring Process", "Assessment, technical, managerial, HR."],
            ["Salary Insights", "Entry package benchmark with role ranges."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <p className="font-bold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {text}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={Github} className="mb-4 text-violet-200" />
        <h3 className="text-2xl font-bold">GitHub Project Analyzer</h3>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
            className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.08]"
            placeholder="Enter GitHub repository URL"
          />
          <button className="rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ background: primaryGradient }}>
            Analyze
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Code Quality", 84, Cpu],
            ["Structure", 91, Layers],
            ["Best Practices", 76, ShieldCheck],
          ].map(([title, score, Icon]) => (
            <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
              <Icon className="mb-3 h-5 w-5 text-violet-300" />
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-2 text-3xl font-black">{score}</p>
              <ProgressBar value={score} color="from-violet-500 to-cyan-400" />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-white/[0.08] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Add tests for auth flows, split API utilities, and document deployment
          variables for interview-ready project storytelling.
        </div>
      </GlassCard>
    </section>
  );
}

function LeetCodeTracker({ theme, practice, loading = false }) {
  const textColor = theme === "dark" ? "#CBD5E1" : "#334155";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const activityDays = useMemo(() => {
    if (practice?.weeklyActivity?.length) {
      return practice.weeklyActivity;
    }

    const today = new Date();

    return Array.from({ length: 28 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index - 27);

      return {
        date: date.toISOString().slice(0, 10),
        completed: false,
      };
    });
  }, [practice?.weeklyActivity]);
  const formatActivityDate = (value) => {
    const [year, month, day] = String(value).split("-").map(Number);

    if (!year || !month || !day) {
      return "Practice day";
    }

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(year, month - 1, day));
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, boxWidth: 10, usePointStyle: true } },
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } },
      },
    }),
    [gridColor, textColor],
  );

  return (
    <GlassCard id="analytics" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={LineChart} className="mb-4 text-emerald-200" />
          <h3 className="text-2xl font-bold">LeetCode Progress Tracker</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Practice streak, GitHub-style activity calendar, topic coverage, and
            accuracy graph.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Current", `${practice?.currentStreak || 0}d`, "text-emerald-300"],
            ["Best", `${practice?.bestStreak || 0}d`, "text-cyan-300"],
            ["Practiced", practice?.totalSolved || 0, "text-violet-300"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg bg-white/[0.08] px-4 py-3">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-72 rounded-lg border border-white/10 bg-white/[0.08] p-4">
          <Line
            data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [
                {
                  label: "Accuracy",
                  data: [62, 66, 72, 70, 77, 81, 84],
                  borderColor: "#A855F7",
                  backgroundColor: "rgba(168, 85, 247, 0.18)",
                  fill: true,
                  tension: 0.42,
                  pointBackgroundColor: "#F8FAFC",
                  pointBorderColor: "#8B5CF6",
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div className="h-72 rounded-lg border border-white/10 bg-white/[0.08] p-4">
          <Bar
            data={{
              labels: ["Array", "String", "Tree", "Graph", "DP"],
              datasets: [
                {
                  label: "Topic Coverage",
                  data: [88, 76, 59, 42, 51],
                  backgroundColor: ["#8B5CF6", "#22D3EE", "#34D399", "#F59E0B", "#FB7185"],
                  borderRadius: 8,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.08] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">DSA Practice Streak</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Green boxes appear only for days you marked DSA practice complete.
            </p>
          </div>
          {loading ? (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Loading activity...
            </p>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-2">
            {activityDays.map((day) => (
              <div
                key={day.date}
                className={`h-4 w-4 rounded-[4px] border transition ${
                  day.completed
                    ? "border-emerald-400/70 bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]"
                    : "border-slate-200/70 bg-slate-200/70 dark:border-white/[0.08] dark:bg-white/[0.10]"
                }`}
                title={`${formatActivityDate(day.date)}: ${
                  day.completed ? "DSA practiced" : "No DSA practice"
                }`}
                aria-label={`${formatActivityDate(day.date)} ${
                  day.completed ? "DSA practiced" : "No DSA practice"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <span className="h-3 w-3 rounded-[3px] border border-slate-200/70 bg-slate-200/70 dark:border-white/[0.08] dark:bg-white/[0.10]" />
          <span className="h-3 w-3 rounded-[3px] border border-emerald-400/70 bg-emerald-500" />
          <span>More</span>
        </div>
      </div>
    </GlassCard>
  );
}

function AchievementsAndReports({ theme }) {
  const textColor = theme === "dark" ? "#CBD5E1" : "#334155";

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr_1fr]">
      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={Award} className="mb-4 text-amber-200" />
        <h3 className="text-xl font-bold">Achievement Badges</h3>
        <div className="mt-5 space-y-3">
          {badges.map(([title, detail, Icon]) => (
            <div key={title} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-3">
              <Icon className="h-5 w-5 text-amber-300" />
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={Trophy} className="mb-4 text-violet-200" />
        <h3 className="text-xl font-bold">Leaderboard</h3>
        <div className="mt-5 space-y-3">
          {leaderboard.map(([name, xp], index) => (
            <div key={name} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500 text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="flex-1 text-sm font-bold">{name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{xp}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={BarChart3} className="mb-4 text-cyan-200" />
        <h3 className="text-xl font-bold">Weekly Reports</h3>
        <div className="mt-5 h-52">
          <Doughnut
            data={{
              labels: ["DSA", "SQL", "Communication", "Projects"],
              datasets: [
                {
                  data: [35, 20, 25, 20],
                  backgroundColor: ["#8B5CF6", "#22D3EE", "#34D399", "#F59E0B"],
                  borderColor: theme === "dark" ? "#0F172A" : "#F8FAFC",
                  borderWidth: 5,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom", labels: { color: textColor, boxWidth: 10 } },
              },
            }}
          />
        </div>
      </GlassCard>
    </section>
  );
}

function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi Sonam, I can help with DSA, SQL, interviews, communication, resumes, planning, and project ideas.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const userText = message.trim();
    setMessages((current) => [
      ...current,
      { from: "user", text: userText },
      {
        from: "ai",
        text: `Great. I would turn "${userText}" into a focused practice plan with one concept review, one timed drill, and one feedback loop.`,
      },
    ]);
    setMessage("");
  };

  const quickPrompts = [
    "Give me a DSA hint",
    "Improve my HR answer",
    "Review SQL query",
    "Plan today's study",
  ];

  return (
    <div id="chatbot" className="fixed bottom-20 right-4 z-50 sm:bottom-5 sm:right-5">
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-4 flex h-[min(70vh,520px)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-slate-950/[0.94] text-white shadow-glow backdrop-blur-2xl sm:h-[560px] sm:w-[min(calc(100vw-2.5rem),420px)]"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold">PrepMate AI Mentor</p>
                <p className="text-xs text-emerald-300">Online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md bg-white/10 p-2"
              aria-label="Close AI chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.text}-${index}`}
                className={`flex ${item.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 ${
                    item.from === "user"
                      ? "bg-violet-500 text-white"
                      : "bg-white/10 text-slate-100"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex gap-2 overflow-auto">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 p-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                className="min-h-11 flex-1 bg-transparent px-3 text-sm outline-none"
                placeholder="Ask anything about placement prep"
              />
              <button
                onClick={sendMessage}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-glow transition hover:-translate-y-1 sm:h-16 sm:w-16"
        style={{ background: primaryGradient }}
        aria-label="Open AI chatbot"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageFrame({ eyebrow, title, children }) {
  return (
    <main className="space-y-4 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
      <SectionHeader eyebrow={eyebrow} title={title} />
      {children}
    </main>
  );
}

function DashboardPage() {
  return (
    <main className="pb-28 lg:pb-10">
      <HeroSection />
      <ProgressDashboard />
    </main>
  );
}

function CommunicationPage() {
  return (
    <PageFrame eyebrow="AI coaching" title="Communication Coach">
      <CommunicationCoach />
    </PageFrame>
  );
}

function DsaPage({ theme }) {
  const [practice, setPractice] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [practiceError, setPracticeError] = useState("");
  const [completingPractice, setCompletingPractice] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadPractice = async () => {
      setPracticeLoading(true);
      setPracticeError("");

      try {
        const payload = await dsaApi.today();

        if (!ignore) {
          setPractice(mergeLocalDsaPractice(payload));
        }
      } catch (error) {
        if (!ignore) {
          setPracticeError(error.message || "Could not load DSA practice.");
        }
      } finally {
        if (!ignore) {
          setPracticeLoading(false);
        }
      }
    };

    loadPractice();

    return () => {
      ignore = true;
    };
  }, []);

  const completePractice = async () => {
    setCompletingPractice(true);
    setPracticeError("");

    try {
      const payload = await dsaApi.completeToday();
      setPractice(payload?.saved === false ? rememberLocalDsaPractice(payload) : payload);
    } catch (error) {
      setPracticeError(error.message || "Could not save today's practice.");
    } finally {
      setCompletingPractice(false);
    }
  };

  return (
    <PageFrame eyebrow="DSA practice" title="DSA Practice Hub">
      <DsaHub
        practice={practice}
        loading={practiceLoading}
        completingPractice={completingPractice}
        onCompletePractice={completePractice}
        status={practiceError}
      />
      <LeetCodeTracker theme={theme} practice={practice} loading={practiceLoading} />
    </PageFrame>
  );
}

function SqlPage() {
  return (
    <PageFrame eyebrow="SQL practice" title="SQL Practice Arena">
      <SqlArena />
    </PageFrame>
  );
}

function InterviewPage() {
  return (
    <PageFrame eyebrow="Interview preparation" title="AI Interview Preparation">
      <InterviewPrep />
    </PageFrame>
  );
}

function DailyPlannerPage() {
  return (
    <PageFrame eyebrow="Productivity" title="Planner, Tasks, and Role Roadmaps">
      <PlannerAndTodo />
      <RoadmapGenerator />
    </PageFrame>
  );
}

function AiMentorPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi Sonam, I can help with DSA, SQL, interviews, communication, resumes, planning, and project ideas.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const userText = message.trim();
    setMessages((current) => [
      ...current,
      { from: "user", text: userText },
      {
        from: "ai",
        text: `Great. I would turn "${userText}" into a focused practice plan with one concept review, one timed drill, and one feedback loop.`,
      },
    ]);
    setMessage("");
  };

  const quickPrompts = [
    "Give me a DSA hint",
    "Improve my HR answer",
    "Review SQL query",
    "Plan today's study",
  ];

  return (
    <PageFrame eyebrow="AI mentor" title="PrepMate AI Mentor">
      <div className="flex h-[calc(100vh-220px)] min-h-[560px] flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-slate-950/[0.94] text-white shadow-glow backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">PrepMate AI Mentor</p>
              <p className="text-xs text-emerald-300">Online</p>
            </div>
          </div>
          <div className="rounded-lg border border-violet-300/30 bg-violet-500/[0.12] px-4 py-2 text-sm font-semibold text-violet-100">
            6,980 XP
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {messages.map((item, index) => (
            <div
              key={`${item.text}-${index}`}
              className={`flex ${item.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  item.from === "user"
                    ? "bg-violet-500 text-white"
                    : "bg-white/10 text-slate-100"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex gap-2 overflow-auto">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setMessage(prompt)}
                className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 p-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
              className="min-h-11 flex-1 bg-transparent px-3 text-sm outline-none"
              placeholder="Ask anything about placement prep"
            />
            <button
              onClick={sendMessage}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function ProfilePage({ theme }) {
  const authSession = useMemo(() => getAuthSession(), []);
  const profileName = authSession?.user?.name || "Sonam";
  const profileEmail = authSession?.user?.email || "sonam@student.dev";
  const firstName = profileName.split(" ")[0] || "Student";
  const profileInitials =
    profileName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";
  const readinessScore = 82;
  const completedSnapshot = progressStats.reduce(
    (total, [, value]) => total + value,
    0,
  );
  const totalSnapshot = progressStats.reduce(
    (total, [, , max]) => total + max,
    0,
  );
  const weeklyAverage = Math.round((completedSnapshot / totalSnapshot) * 100);
  const profileStats = [
    ["XP", "6,980", "Top 12% cohort", Trophy, "text-amber-300"],
    ["Readiness", `${readinessScore}%`, "Interview target", TrendingUp, "text-emerald-300"],
    ["Streak", "21 days", "Best run active", Flame, "text-rose-300"],
    ["Applications", "9 active", "2 interviews warm", Briefcase, "text-cyan-300"],
  ];
  const skillStack = [
    ["React", 88, "UI patterns"],
    ["Node.js", 76, "API depth"],
    ["MongoDB", 72, "Data modeling"],
    ["SQL", 80, "Joins and windows"],
    ["DSA", 74, "Daily drills"],
    ["Communication", 82, "Clear answers"],
  ];
  const focusPlan = [
    ["Today", "Revise sliding window and solve one timed medium problem.", Code2],
    ["This week", "Convert project notes into STAR interview stories.", MessageSquareText],
    ["Before next mock", "Add metrics to resume bullets and GitHub README.", FileText],
  ];
  const quickActions = [
    ["Practice DSA", "/dsa", Code2],
    ["Mock Interview", "/interview", Mic2],
    ["Plan Today", "/daily-planner", CalendarCheck],
  ];

  return (
    <PageFrame eyebrow="Profile" title="Student Profile and Career Tools">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="overflow-hidden">
          <div className="bg-slate-950 p-5 text-white sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg text-3xl font-black text-white shadow-glow"
                  style={{ background: primaryGradient }}
                  aria-label={`${profileName} profile avatar`}
                >
                  {profileInitials}
                </div>
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {["MERN Developer", "Final-year Prep", "Open to SDE"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-violet-100"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-violet-200">Placement Profile</p>
                  <h3 className="mt-2 truncate text-3xl font-black sm:text-4xl">
                    {profileName}
                  </h3>
                  <p className="mt-2 break-words text-sm text-slate-300">
                    {profileEmail}
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 sm:w-auto"
              >
                <Settings className="mr-2 h-5 w-5" />
                Update Profile
              </Link>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">
              {firstName} is tracking a balanced placement path across DSA, SQL,
              communication, interview stories, resume polish, and company research.
            </p>
          </div>

          <div className="grid gap-px bg-slate-200/70 dark:bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
            {profileStats.map(([label, value, caption, Icon, color]) => (
              <div key={label} className="bg-white/70 p-4 dark:bg-white/[0.06] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="mt-3 text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="mx-auto flex h-40 w-40 shrink-0 items-center justify-center rounded-full p-3 sm:mx-0"
              style={{
                background: `conic-gradient(#8B5CF6 ${
                  readinessScore * 3.6
                }deg, rgba(148, 163, 184, 0.22) 0deg)`,
              }}
              aria-label={`Placement readiness ${readinessScore}%`}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-slate-950 shadow-soft-panel dark:bg-slate-950 dark:text-paper">
                <span className="text-4xl font-black">{readinessScore}%</span>
                <span className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Ready
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <IconBadge icon={Target} className="mb-4 text-violet-200" />
              <h3 className="text-2xl font-bold">Readiness Dashboard</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Weekly preparation average is {weeklyAverage}% with strongest momentum
                in communication and resume readiness.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  ["Primary goal", "Crack SDE campus interviews", Rocket],
                  ["Target stack", "React, Node.js, MongoDB, SQL", Layers],
                  ["Next milestone", "2 mock interviews this week", CalendarCheck],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="flex items-center gap-3 border-t border-white/10 pt-3">
                    <Icon className="h-5 w-5 text-violet-300" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="truncate text-sm font-bold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <IconBadge icon={BarChart3} className="mb-4 text-cyan-200" />
              <h3 className="text-2xl font-bold">Preparation Snapshot</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Current progress across the major placement tracks.
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/[0.12] px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-100">
              {weeklyAverage}% weekly average
            </span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {progressStats.map(([label, value, total, caption, Icon, color]) => (
              <Link
                key={label}
                to={progressRoutes[label]}
                className="block rounded-lg border border-white/10 bg-white/[0.08] p-4 text-current no-underline transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-violet-300" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{label}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {caption}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-black">
                    {Math.round((value / total) * 100)}%
                  </span>
                </div>
                <ProgressBar value={value} total={total} color={color} />
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={Sparkles} className="mb-4 text-amber-200" />
          <h3 className="text-2xl font-bold">Focus Plan</h3>
          <div className="mt-5 space-y-4">
            {focusPlan.map(([label, detail, Icon]) => (
              <div key={label} className="flex gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-violet-300" />
                <div>
                  <p className="text-sm font-black">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {quickActions.map(([label, path, Icon]) => (
              <Link
                key={label}
                to={path}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-current transition hover:-translate-y-0.5"
              >
                <Icon className="mr-2 h-5 w-5 text-violet-300" />
                {label}
              </Link>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr_0.85fr]">
        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={BrainCircuit} className="mb-4 text-violet-200" />
          <h3 className="text-2xl font-bold">Skill Matrix</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {skillStack.map(([skill, value, note]) => (
              <div key={skill}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{skill}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
                  </div>
                  <span className="text-sm font-black">{value}%</span>
                </div>
                <ProgressBar
                  value={value}
                  color={value >= 82 ? "from-emerald-400 to-cyan-400" : "from-violet-500 to-fuchsia-500"}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={Award} className="mb-4 text-amber-200" />
          <h3 className="text-2xl font-bold">Badge Shelf</h3>
          <div className="mt-5 space-y-3">
            {badges.slice(0, 3).map(([title, detail, Icon]) => (
              <div key={title} className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-400/[0.16] text-amber-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={ClipboardCheck} className="mb-4 text-emerald-200" />
          <h3 className="text-2xl font-bold">Career Checklist</h3>
          <div className="mt-5 space-y-3">
            {[
              ["Resume ATS score", "86/100", ShieldCheck],
              ["GitHub project story", "Needs metrics", Github],
              ["Company pipeline", "5 stages tracked", Building2],
              ["Interview stories", "7 prepared", Star],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-violet-300" />
                <p className="min-w-0 flex-1 text-sm font-semibold">{label}</p>
                <span className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <a
            href="#career"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-black text-white"
            style={{ background: primaryGradient }}
          >
            <FileText className="mr-2 h-5 w-5" />
            Review Career Tools
          </a>
        </GlassCard>
      </section>

      <ResumeAnalyzer />
      <JobTracker />
      <CompanyAndGithub />
      <AchievementsAndReports theme={theme} />
    </PageFrame>
  );
}

function SettingsPage({ theme, setTheme }) {
  return (
    <PageFrame eyebrow="Settings" title="Workspace Settings">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={Settings} className="mb-4 text-violet-200" />
          <h3 className="text-2xl font-bold">Appearance</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Keep the workspace theme aligned with your study environment.
          </p>
          <button
            className="mt-5 inline-flex items-center rounded-lg px-5 py-3 text-sm font-bold text-white"
            style={{ background: primaryGradient }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-5 w-5" />
            ) : (
              <Moon className="mr-2 h-5 w-5" />
            )}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={Bell} className="mb-4 text-emerald-200" />
          <h3 className="text-2xl font-bold">Notifications</h3>
          <div className="mt-5 space-y-3">
            {[
              ["Mock interview reminders", true],
              ["Daily planner digest", true],
              ["Resume and application alerts", false],
            ].map(([label, checked]) => (
              <label
                key={label}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4"
              >
                <input
                  type="checkbox"
                  defaultChecked={checked}
                  className="h-5 w-5 accent-violet-500"
                />
                <span className="text-sm font-semibold">{label}</span>
              </label>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {[
          ["Learning Mode", "Balanced practice across DSA, SQL, communication, and interviews.", BrainCircuit],
          ["Privacy", "Keep mentor chats and planner tasks scoped to this workspace.", ShieldCheck],
          ["Focus Defaults", "Use deep work blocks with priority tasks and progress signals.", Sparkles],
        ].map(([title, detail, Icon]) => (
          <GlassCard key={title} className="p-5 sm:p-6">
            <IconBadge icon={Icon} className="mb-4 text-cyan-200" />
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {detail}
            </p>
          </GlassCard>
        ))}
      </section>
    </PageFrame>
  );
}

function AppRoutes({ theme, setTheme }) {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dsa" element={<DsaPage theme={theme} />} />
        <Route path="/sql" element={<SqlPage />} />
        <Route path="/communication" element={<CommunicationPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/ai-mentor" element={<AiMentorPage />} />
        <Route path="/daily-planner" element={<DailyPlannerPage />} />
        <Route path="/profile" element={<ProfilePage theme={theme} />} />
        <Route
          path="/settings"
          element={<SettingsPage theme={theme} setTheme={setTheme} />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {location.pathname !== "/ai-mentor" ? <AiChatbot /> : null}
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ScrollToTop />
      <AppShell
        theme={theme}
        setTheme={setTheme}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
      >
        <AppRoutes theme={theme} setTheme={setTheme} />
      </AppShell>
    </BrowserRouter>
  );
}

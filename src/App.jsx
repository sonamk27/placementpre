import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
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
  Sun,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  UploadCloud,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { communicationApi } from "./api";

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

const communicationFeatures = [
  ["Daily Speaking Topic", "Describe a project where you solved a real user problem."],
  ["Vocabulary Builder", "impact, iteration, adoption, measurable"],
  ["Grammar Correction", "Past tense, articles, punctuation, and sentence flow."],
  ["Mock HR Interview", "Tell me about yourself. Why should we hire you?"],
  ["Confidence Score", "Grammar 8, vocabulary 7, fluency 8, confidence 8."],
];

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
  High: "border-rose-400/40 bg-rose-500/[0.15] text-rose-100",
  Medium: "border-amber-300/40 bg-amber-400/[0.15] text-amber-100",
  Low: "border-emerald-300/40 bg-emerald-400/[0.15] text-emerald-100",
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
    topic: "Describe a project where you solved a real user problem.",
    vocabularyWord: {
      word: "impact",
      meaning: "a measurable effect or result",
      example: "My project created impact by reducing manual tracking time.",
    },
    motivationQuote: "Every polished answer starts as one honest attempt.",
  };
  const [starter, setStarter] = useState(defaultStarter);
  const [message, setMessage] = useState("Today I practice React and DSA.");
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coachError, setCoachError] = useState("");

  const refreshCoachData = async () => {
    const [statsPayload, historyPayload] = await Promise.all([
      communicationApi.stats(),
      communicationApi.history(),
    ]);
    setStats(statsPayload);
    setHistory(historyPayload.conversations || []);
  };

  useEffect(() => {
    let active = true;

    const loadCoach = async () => {
      try {
        const [topicPayload, statsPayload, historyPayload] = await Promise.all([
          communicationApi.startTopic(),
          communicationApi.stats(),
          communicationApi.history(),
        ]);

        if (!active) return;
        setStarter(topicPayload);
        setStats(statsPayload);
        setHistory(historyPayload.conversations || []);
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

  const analyzeAnswer = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setCoachError("");

    try {
      const health = await communicationApi.health();

      if (health.database !== "connected") {
        setCoachError(
          "Database is not connected. Start MongoDB before analyzing and saving answers.",
        );
        return;
      }

      const result = await communicationApi.analyze({
        message,
        topic: starter.topic,
      });
      setAnalysis(result);
      await refreshCoachData();
    } catch (error) {
      setCoachError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confidenceScore =
    analysis?.confidenceScore || stats?.averageConfidenceScore || 88;
  const vocabularyDetail = starter.vocabularyWord
    ? `${starter.vocabularyWord.word}: ${starter.vocabularyWord.meaning}`
    : "impact, iteration, adoption, measurable";
  const latestConversation = history[0];
  const featureItems = [
    ["Daily Speaking Topic", starter.topic],
    ["Vocabulary Builder", vocabularyDetail],
    [
      "Grammar Correction",
      analysis
        ? `${analysis.grammarScore}/10. ${analysis.feedback}`
        : "Past tense, articles, punctuation, and sentence flow.",
    ],
    [
      "Mock HR Interview",
      analysis?.followUpQuestion ||
        latestConversation?.followUpQuestion ||
        "Tell me about yourself. Why should we hire you?",
    ],
    [
      "Confidence Score",
      stats?.totalConversations
        ? `Grammar ${stats.averageGrammarScore}, vocabulary ${stats.averageVocabularyScore}, fluency ${stats.averageFluencyScore}, confidence ${stats.averageConfidenceScore}.`
        : "Grammar 8, vocabulary 7, fluency 8, confidence 8.",
    ],
  ];
  const resultCards = [
    [
      "Corrected Version",
      analysis?.correctedMessage ||
        latestConversation?.correctedMessage ||
        "Today, I practiced React and DSA.",
    ],
    [
      "Grammar Score",
      analysis
        ? `${analysis.grammarScore}/10. ${analysis.feedback}`
        : latestConversation
          ? `${latestConversation.grammarScore}/10. ${latestConversation.feedback}`
          : "8/10. Use past tense consistently.",
    ],
    [
      "AI Suggestion",
      analysis?.recommendations?.join(" ") ||
        latestConversation?.recommendations?.join(" ") ||
        "Use stronger words like implemented, improved, optimized.",
    ],
    [
      "Mock HR Follow-up",
      analysis?.followUpQuestion ||
        latestConversation?.followUpQuestion ||
        "What problem did your project solve for users?",
    ],
  ];

  return (
    <GlassCard id="communication" className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={Mic2} className="mb-4 text-emerald-200" />
          <h3 className="text-2xl font-bold">AI Communication Coach</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Correct grammar, improve answers, suggest better vocabulary, simulate
            HR interviews, and build confidence for placement conversations.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/[0.12] p-5 text-center">
          <p className="text-sm text-emerald-800 dark:text-emerald-100">
            Confidence Score
          </p>
          <p className="mt-1 text-4xl font-black">{confidenceScore}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {featureItems.map(([title, detail]) => (
          <div
            key={title}
            className="rounded-lg border border-white/10 bg-white/[0.08] p-4"
          >
            <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-300" />
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950/90 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
            Daily Speaking Topic
          </p>
          <p className="mt-3 text-lg font-semibold">
            {starter.topic}
          </p>
          {starter.vocabularyWord ? (
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Word of the day: {starter.vocabularyWord.word} -{" "}
              {starter.vocabularyWord.example}
            </p>
          ) : null}
          <textarea
            className="mt-5 min-h-[150px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.08] p-4 text-sm outline-none focus:border-violet-300"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          {coachError ? (
            <p className="mt-3 text-sm text-rose-200">{coachError}</p>
          ) : null}
          <button
            className="mt-4 inline-flex items-center rounded-lg px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: primaryGradient }}
            onClick={analyzeAnswer}
            disabled={loading}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {loading ? "Analyzing..." : "Analyze Answer"}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {resultCards.map(([title, text]) => (
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

function DsaHub() {
  const [difficulty, setDifficulty] = useState("Medium");
  const problem = dsaProblems[difficulty];

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
        <div className="flex rounded-lg border border-white/10 bg-white/[0.08] p-1">
          {["Easy", "Medium", "Hard"].map((item) => (
            <button
              key={item}
              onClick={() => setDifficulty(item)}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                difficulty === item
                  ? "bg-white text-slate-950"
                  : "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
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
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-slate-950 p-5 text-white">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-violet-200">Daily DSA Question</p>
            <span className="rounded-full bg-violet-500/25 px-3 py-1 text-xs font-bold">
              {difficulty}
            </span>
          </div>
          <h4 className="text-xl font-black">{problem.title}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{problem.prompt}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["AI Hint", "Use a sliding window and track latest indices."],
              ["AI Solution", "Update left pointer only when repeat is inside window."],
              ["Time Complexity", problem.time],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <CodeEditor title="solution.js">
{`function solve(input) {
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
}`}
        </CodeEditor>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Acceptance", problem.acceptance],
          ["Runtime Beat", "91%"],
          ["Topic Progress", "68%"],
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
  const [tasks, setTasks] = useState([
    ["Revise sliding window", "High", "45 min"],
    ["Build SQL joins notes", "Medium", "30 min"],
    ["Record intro answer", "High", "15 min"],
  ]);
  const [taskText, setTaskText] = useState("Apply to 2 internships");

  const addTask = () => {
    if (!taskText.trim()) return;
    setTasks((current) => [...current, [taskText.trim(), "Medium", "25 min"]]);
    setTaskText("");
  };

  return (
    <section id="planner" className="grid gap-4 xl:grid-cols-2">
      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={CalendarCheck} className="mb-4 text-emerald-200" />
        <h3 className="text-2xl font-bold">Smart Daily Planner</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          AI-generated daily targets based on your progress and weak areas.
        </p>
        <div className="mt-5 space-y-3">
          {plannerGoals.map(([goal, priority, time]) => (
            <label
              key={goal}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4"
            >
              <input type="checkbox" className="h-5 w-5 accent-violet-500" />
              <span className="flex-1 text-sm font-semibold">{goal}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityStyles[priority]}`}>
                {priority}
              </span>
              <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                {time}
              </span>
            </label>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <IconBadge icon={ListChecks} className="mb-4 text-violet-200" />
        <h3 className="text-2xl font-bold">AI To-Do List</h3>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={taskText}
            onChange={(event) => setTaskText(event.target.value)}
            className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.08]"
            placeholder="Add task"
          />
          <button
            onClick={addTask}
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white"
            style={{ background: primaryGradient }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Task
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {tasks.map(([task, priority, estimate], index) => (
            <div key={`${task}-${index}`} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-3">
              <Pencil className="h-4 w-4 text-slate-400" />
              <p className="flex-1 text-sm font-semibold">{task}</p>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityStyles[priority]}`}>
                {priority}
              </span>
              <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                {estimate}
              </span>
              <button
                onClick={() => setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index))}
                className="rounded-md bg-white/10 p-2"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-violet-300/20 bg-violet-400/[0.12] p-4 text-sm leading-6">
          AI Suggestion: Rearrange tasks by interview impact, finish DSA before
          lower-priority applications, and reserve 20 minutes for reflection.
        </div>
      </GlassCard>
    </section>
  );
}

function RoadmapGenerator() {
  const [role, setRole] = useState("MERN Developer");
  const plan = roadmapPlans[role];

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <IconBadge icon={Map} className="mb-4 text-cyan-200" />
          <h3 className="text-2xl font-bold">AI Roadmap Generator</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Select a role and get a weekly roadmap, learning path, and skills
            progress plan.
          </p>
        </div>
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
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {plan.map(([week, detail]) => (
          <div key={week} className="roadmap-step">
            <p className="text-sm font-black text-violet-300">{week}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {detail}
            </p>
            <ProgressBar value={week === "Week 1" ? 86 : week === "Week 2" ? 52 : 22} />
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

function LeetCodeTracker({ theme }) {
  const textColor = theme === "dark" ? "#CBD5E1" : "#334155";
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

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
            Problems solved, difficulty counts, streak calendar, topic coverage,
            and accuracy graph.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Easy", 118, "text-emerald-300"],
            ["Medium", 74, "text-amber-300"],
            ["Hard", 18, "text-rose-300"],
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
      <div className="mt-5 grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md ${
              index % 5 === 0
                ? "bg-violet-500"
                : index % 3 === 0
                  ? "bg-emerald-400"
                  : "bg-white/[0.12]"
            }`}
            title={`Day ${index + 1}`}
          />
        ))}
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
  return (
    <PageFrame eyebrow="DSA practice" title="DSA Practice Hub">
      <DsaHub />
      <LeetCodeTracker theme={theme} />
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
  return (
    <PageFrame eyebrow="Profile" title="Student Profile and Career Tools">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-lg text-white shadow-glow"
              style={{ background: primaryGradient }}
            >
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Placement Profile
              </p>
              <h3 className="mt-2 text-3xl font-black">Sonam</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                MERN-focused placement preparation with strong DSA, SQL,
                communication, and project storytelling goals.
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["XP", "6,980"],
              ["Readiness", "82%"],
              ["Streak", "21 days"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <IconBadge icon={Target} className="mb-4 text-violet-200" />
          <h3 className="text-2xl font-bold">Preparation Snapshot</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {progressStats.slice(0, 4).map(([label, value, total, caption, Icon, color]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-violet-300" />
                  <p className="text-sm font-bold">{label}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
                <ProgressBar value={value} total={total} color={color} />
              </div>
            ))}
          </div>
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

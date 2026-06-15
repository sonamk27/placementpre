import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { isDatabaseConnected } from "./config/database.js";
import { config } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(morgan(config.isProduction ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.json({
    service: "PrepMate AI backend",
    status: "running",
    frontend: "http://127.0.0.1:5173",
    health: "/api/health",
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "prepmate-ai-api",
    database: isDatabaseConnected() ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/communication", communicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

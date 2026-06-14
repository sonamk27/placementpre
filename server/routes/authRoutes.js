import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getMe, login, register } from "../controllers/authController.js";
import { authenticateJwt } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { loginValidator, registerValidator } from "../validators/authValidators.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/register", authLimiter, registerValidator, validateRequest, register);
router.post("/login", authLimiter, loginValidator, validateRequest, login);
router.get("/me", authenticateJwt, getMe);

export default router;

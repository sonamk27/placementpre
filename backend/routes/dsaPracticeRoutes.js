import { Router } from "express";
import {
  completeTodayDsaPracticeController,
  getTodayDsaPracticeController,
} from "../controllers/dsaPracticeController.js";
import { attachCommunicationUser } from "../middleware/authMiddleware.js";

const router = Router();

router.use(attachCommunicationUser);

router.get("/today", getTodayDsaPracticeController);
router.post("/today/complete", completeTodayDsaPracticeController);

export default router;

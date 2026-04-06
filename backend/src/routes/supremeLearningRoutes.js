import express from "express";
import { generateSupremeLearning } from "../controllers/supremeLearningController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticateToken, generateSupremeLearning);

export default router;

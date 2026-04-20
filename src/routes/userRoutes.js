import express from "express";
import { getUserDashboard, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.get("/dashboard", protect, getUserDashboard);

export default router;

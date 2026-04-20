import express from "express";
import {
  addReview,
  getReviewsByVehicle,
  moderateReview
} from "../controllers/reviewController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/vehicle/:vehicleId", getReviewsByVehicle);
router.post("/", protect, addReview);
router.patch("/:id/moderate", protect, adminOnly, moderateReview);

export default router;

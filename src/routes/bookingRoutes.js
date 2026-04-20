import express from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  updateBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;

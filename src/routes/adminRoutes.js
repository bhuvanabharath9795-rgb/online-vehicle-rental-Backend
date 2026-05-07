import express from "express";
import {
  completeBooking,
  getAdminDashboard,
  getAdminStats,
  getAllUsers,
  rentalHistoryReport,
  updateVehicleStatus
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.get("/users", getAllUsers);
router.patch("/vehicles/:id/status", updateVehicleStatus);
router.patch("/bookings/:id/complete", completeBooking);
router.get("/rental-history/:vehicleId", rentalHistoryReport);
router.get("/stats", protect, adminOnly, getAdminStats);

export default router;

import express from "express";
import {
  addMaintenanceRecord,
  getMaintenanceByVehicle
} from "../controllers/maintenanceController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/vehicle/:vehicleId", getMaintenanceByVehicle);
router.post("/", protect, adminOnly, addMaintenanceRecord);

export default router;

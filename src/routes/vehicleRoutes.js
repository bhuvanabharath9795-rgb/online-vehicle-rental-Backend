import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle
} from "../controllers/vehicleController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/")
 .post( protect, (req, res, next) => {
  upload.single("image")(req, res, function (err) {
    if (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
        name: err.name,
      });
    }
    next();
  });
}, createVehicle)
  .get(getVehicles);

router.route("/:id")
  .get(getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

export default router;
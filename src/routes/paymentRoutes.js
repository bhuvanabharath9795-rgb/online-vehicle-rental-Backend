import express from "express";
import {
  createRazorpayOrder,
  getInvoiceByBooking,
  getMyPayments,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.get("/my", getMyPayments);
router.get("/invoice/:bookingId", getInvoiceByBooking);

export default router;

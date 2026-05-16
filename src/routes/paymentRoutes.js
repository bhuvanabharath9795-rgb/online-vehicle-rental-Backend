import express from "express";
import {
  createRazorpayOrder,
  getInvoiceByBooking,
  getMyPayments,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Invoice route before blanket protect so it can accept token via query param
// (browsers can't send Authorization header when opening a URL directly)
router.get(
  "/invoice/:bookingId",
  (req, res, next) => {
    if (req.query.token && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
  },
  protect,
  getInvoiceByBooking
);

router.use(protect);
router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.get("/my", getMyPayments);

export default router;

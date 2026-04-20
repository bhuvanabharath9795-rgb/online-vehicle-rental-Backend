import crypto from "crypto";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import razorpay from "../config/razorpay.js";
import { sendBookingConfirmation } from "./bookingController.js";
export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const options = {
      amount: booking.totalAmount * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      currency: "INR",
      razorpayOrderId: order.id,
      invoiceNumber: `INV-${Date.now()}`
    });

    booking.paymentId = payment._id;
    await booking.save();

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
      paymentRecordId: payment._id
    });
  } catch (error) {
    console.log("createRazorpayOrder error:", error);
    return res.status(error.statusCode || 500).json({
      message:
        error?.error?.description ||
        error.message ||
        "Failed to create Razorpay order"
    });
  }
};
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      bookingId,
      paymentRecordId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isTestBypass
    } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let payment = null;

    if (paymentRecordId) {
      payment = await Payment.findById(paymentRecordId);
    }

    if (!payment) {
      payment = await Payment.findOne({
        booking: bookingId,
        razorpayOrderId: razorpay_order_id
      });
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (isTestBypass) {
      payment.razorpayPaymentId = razorpay_payment_id || "test_payment_id";
      payment.razorpaySignature = razorpay_signature || "test_signature";
      payment.status = "captured";
      await payment.save();

      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      await booking.save();

      await sendBookingConfirmation(booking);

      return res.json({
        success: true,
        message: "Payment verified successfully (test mode)",
        payment
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    await booking.save();

    await sendBookingConfirmation(booking);

    return res.json({
      success: true,
      message: "Payment verified successfully",
      payment
    });
  } catch (error) {
    console.error("verifyRazorpayPayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
};

export const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate({
      path: "booking",
      populate: { path: "vehicle" }
    })
    .sort({ createdAt: -1 });

  res.json(payments);
};

export const getInvoiceByBooking = async (req, res) => {
  const payment = await Payment.findOne({ booking: req.params.bookingId })
    .populate("user", "name email")
    .populate({
      path: "booking",
      populate: { path: "vehicle" }
    });

  if (!payment) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  if (String(payment.user._id) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  res.json({
    invoiceNumber: payment.invoiceNumber,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    issuedAt: payment.createdAt,
    customer: payment.user,
    booking: payment.booking
  });
};

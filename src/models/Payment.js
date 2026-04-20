import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "Booking",
        required: true
       },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: {
      type: String,
      enum: ["created", "captured", "failed", "refunded"],
      default: "created"
    },
    invoiceNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

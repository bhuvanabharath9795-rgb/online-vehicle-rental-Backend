import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pickupLocation: { type: String, default: "" },
    dropLocation: { type: String, default: "" },
    totalDays: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);

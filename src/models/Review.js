import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

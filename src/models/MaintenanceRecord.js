import mongoose from "mongoose";

const maintenanceRecordSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    title: { type: String, required: true },
    details: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    cost: { type: Number, default: 0 },
    nextServiceDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceRecord", maintenanceRecordSchema);

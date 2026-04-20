import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
  type: String,
  enum: ["pending", "approved"],
  default: "approved"
},
    maintenanceRecords: [
      {
        title: String,
        details: String,
        date: Date,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
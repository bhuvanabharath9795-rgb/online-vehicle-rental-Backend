import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";
import { calculateAmount, calculateDays } from "../utils/calculateBookingAmount.js";


export const createBooking = async (req, res) => {
  const { vehicleId, startDate, endDate, pickupLocation, dropLocation } = req.body;

  const cleanVehicleId = vehicleId.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanVehicleId)) {
    return res.status(400).json({ message: "Invalid vehicle ID" });
  }

  const vehicle = await Vehicle.findById(cleanVehicleId);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  if (vehicle.status !== "approved") {
    return res.status(400).json({ message: "Vehicle is not approved yet" });
  }

  const totalDays = calculateDays(startDate, endDate);
  if (totalDays <= 0) {
    return res.status(400).json({ message: "Invalid booking dates" });
  }

  const conflict = await Booking.findOne({
    vehicle: cleanVehicleId,
    bookingStatus: { $in: ["pending", "confirmed"] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  if (conflict) {
    return res.status(400).json({ message: "Vehicle already booked for selected dates" });
  }

  const totalAmount = calculateAmount(vehicle.pricePerDay, totalDays);

  const booking = await Booking.create({
    user: req.user._id,
    vehicle: cleanVehicleId,
    startDate,
    endDate,
    pickupLocation,
    dropLocation,
    totalDays,
    totalAmount
  });

  res.status(201).json(booking);
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("vehicle")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("vehicle")
    .populate("user", "name email");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (String(booking.user._id) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  res.json(booking);
};

export const updateBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vehicle");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (String(booking.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (booking.paymentStatus === "paid") {
    return res.status(400).json({ message: "Paid booking cannot be modified from this endpoint" });
  }

  const newStartDate = req.body.startDate || booking.startDate;
  const newEndDate = req.body.endDate || booking.endDate;

  const totalDays = calculateDays(newStartDate, newEndDate);
  if (totalDays <= 0) {
    return res.status(400).json({ message: "Invalid booking dates" });
  }

  const conflict = await Booking.findOne({
    _id: { $ne: booking._id },
    vehicle: booking.vehicle._id,
    bookingStatus: { $in: ["pending", "confirmed"] },
    $or: [
      { startDate: { $lte: newEndDate }, endDate: { $gte: newStartDate } }
    ]
  });

  if (conflict) {
    return res.status(400).json({ message: "Vehicle already booked for selected dates" });
  }

  booking.startDate = newStartDate;
  booking.endDate = newEndDate;
  booking.pickupLocation = req.body.pickupLocation || booking.pickupLocation;
  booking.dropLocation = req.body.dropLocation || booking.dropLocation;
  booking.totalDays = totalDays;
  booking.totalAmount = calculateAmount(booking.vehicle.pricePerDay, totalDays);

  const updated = await booking.save();
  res.json(updated);
};export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      String(booking.user._id) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    /*try {
      await sendEmail({
        to: booking.user.email,
        subject: "Booking Cancelled",
        html: `<p>Your booking for <b>${booking.vehicle.title}</b> has been cancelled.</p>`
      });
    } catch (emailError) {
      console.log("Email failed:", emailError);
    }*/

    return res.json({ message: "Booking cancelled" });
  } catch (error) {
    console.log("cancelBooking error:", error);
    return res.status(500).json({ message: "Server error while cancelling booking" });
  }
};

export const sendBookingConfirmation = async (booking) => {
  try {
    await booking.populate("user vehicle");
    await sendEmail({
      to: booking.user.email,
      subject: "Booking Confirmed",
      html: `
        <h2>Booking Confirmation</h2>
        <p>Vehicle: <b>${booking.vehicle.title}</b></p>
        <p>From: ${new Date(booking.startDate).toDateString()}</p>
        <p>To: ${new Date(booking.endDate).toDateString()}</p>
        <p>Total: ₹${booking.totalAmount}</p>
      `
    });
  } catch (error) {
    console.log("Booking confirmation email failed:", error.message);
  }
};

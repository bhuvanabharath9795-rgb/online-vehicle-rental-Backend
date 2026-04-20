import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

export const getAdminDashboard = async (req, res) => {
  const [
    usersCount,
    vehiclesCount,
    bookingsCount,
    payments,
    pendingVehicles,
    pendingReviews,
    recentBookings
  ] = await Promise.all([
    User.countDocuments(),
    Vehicle.countDocuments(),
    Booking.countDocuments(),
    Payment.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email"),
    Vehicle.find({ status: "pending" }).sort({ createdAt: -1 }),
    Review.find({ status: "pending" }).sort({ createdAt: -1 }).populate("user vehicle"),
    Booking.find().sort({ createdAt: -1 }).limit(10).populate("vehicle user")
  ]);

  const revenue = payments.reduce((sum, item) => sum + (item.status === "captured" ? item.amount : 0), 0);

  res.json({
    stats: { usersCount, vehiclesCount, bookingsCount, revenue },
    pendingVehicles,
    pendingReviews,
    recentBookings,
    payments
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateVehicleStatus = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  vehicle.status = req.body.status;
  await vehicle.save();

  res.json(vehicle);
};

export const completeBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.bookingStatus = "completed";
  await booking.save();

  res.json(booking);
};

export const rentalHistoryReport = async (req, res) => {
  const bookings = await Booking.find({ vehicle: req.params.vehicleId })
    .populate("user", "name email")
    .populate("vehicle", "title make model")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

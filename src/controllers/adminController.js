import User from "../models/User.js";
import Vehicle from "../models/vehicle.js";
import Booking from "../models/booking.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const bookings = await Booking.find();

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    res.json({
      totalUsers,
      totalVehicles,
      totalBookings,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.bookingStatus = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete booking" });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const vehiclesCount = await Vehicle.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    const paidBookings = await Booking.find({ paymentStatus: "paid" });
    const revenue = paidBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );

    const pendingVehicles = await Vehicle.find({ status: "pending" }).limit(10);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("vehicle");

    res.json({
      stats: {
        usersCount,
        vehiclesCount,
        bookingsCount,
        revenue,
      },
      pendingVehicles,
      pendingReviews: [],
      recentBookings,
    });
  } catch (error) {
    console.log("getAdminDashboard error:", error);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const updateVehicleStatus = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.status = req.body.status;
    await vehicle.save();

    res.json({ message: "Vehicle status updated", vehicle });
  } catch (error) {
    res.status(500).json({ message: "Failed to update vehicle status" });
  }
};

export const rentalHistoryReport = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("vehicle");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to load rental history" });
  }
};
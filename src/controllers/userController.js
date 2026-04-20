import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    address: updated.address,
    role: updated.role
  });
};

export const getUserDashboard = async (req, res) => {
  const [bookings, payments, reviews] = await Promise.all([
    Booking.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 }),
    Payment.find({ user: req.user._id }).populate({
      path: "booking",
      populate: { path: "vehicle" }
    }).sort({ createdAt: -1 }),
    Review.find({ user: req.user._id }).populate("vehicle").sort({ createdAt: -1 })
  ]);

  res.json({ bookings, payments, reviews });
};

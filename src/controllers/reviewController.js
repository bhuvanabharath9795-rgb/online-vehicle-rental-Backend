import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

const updateVehicleRating = async (vehicleId) => {
  const approvedReviews = await Review.find({ vehicle: vehicleId, status: "approved" });
  const totalReviews = approvedReviews.length;
  const averageRating = totalReviews
    ? approvedReviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
    : 0;

  await Vehicle.findByIdAndUpdate(vehicleId, { averageRating, totalReviews });
};

export const addReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId).populate("vehicle");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (String(booking.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (booking.bookingStatus !== "completed" && booking.bookingStatus !== "confirmed") {
    return res.status(400).json({ message: "Complete or confirm booking before reviewing" });
  }

  const review = await Review.create({
    user: req.user._id,
    vehicle: booking.vehicle._id,
    booking: booking._id,
    rating,
    comment
  });

  res.status(201).json(review);
};

export const getReviewsByVehicle = async (req, res) => {
  const reviews = await Review.find({
    vehicle: req.params.vehicleId,
    status: "approved"
  }).populate("user", "name").sort({ createdAt: -1 });

  res.json(reviews);
};

export const moderateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.status = req.body.status;
  await review.save();
  await updateVehicleRating(review.vehicle);

  res.json(review);
};

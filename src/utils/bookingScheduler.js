import Booking from "../models/Booking.js";
import { sendEmail } from "./sendEmail.js";

/**
 * Updates booking statuses based on end date
 * Converts "confirmed" → "completed" when rental period ends
 */
export const updateBookingStatuses = async () => {
  try {
    console.log("🔄 Running booking status update...");

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Query: Find all confirmed, paid bookings where rental has ended
    const completedBookings = await Booking.find({
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      endDate: { $lte: now }
    }).populate("user vehicle");

    console.log(`Found ${completedBookings.length} completed rentals`);

    // Update each booking to "completed"
    for (const booking of completedBookings) {
      booking.bookingStatus = "completed";
      const updatedBooking = await booking.save();

      console.log(`✓ Updated booking ${booking._id} to completed`);

      // Send completion email to user
      try {
        const vehicleInfo = booking.vehicle?.title || booking.vehicle?.model || "Vehicle";
        
        await sendEmail(
          booking.user.email,
          "Your Rental is Complete 🚗",
          `
            <h2>Thank You for Renting With Us!</h2>
            <p>Your rental for <b>${vehicleInfo}</b> has been completed.</p>
            <p><b>Rental Period:</b> ${new Date(booking.startDate).toDateString()} - ${new Date(booking.endDate).toDateString()}</p>
            <p><b>Total Amount Paid:</b> ₹${booking.totalAmount}</p>
            <hr>
            <p>We'd love to hear your feedback! Please leave a review of your experience.</p>
            <a href="${process.env.FRONTEND_URL}/my-reviews" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Leave a Review
            </a>
          `
        );

        console.log(`✓ Sent completion email to ${booking.user.email}`);
      } catch (emailError) {
        console.warn(`⚠️ Failed to send completion email: ${emailError.message}`);
        // Don't fail the entire update if email fails
      }
    }

    console.log(`✅ Booking status update complete. Updated ${completedBookings.length} bookings`);
    return completedBookings.length;
  } catch (error) {
    console.error("❌ Booking status update error:", error.message);
    // Don't throw - let it fail silently so it doesn't crash the server
  }
};

/**
 * Also check for and handle overdue pending bookings
 * (Bookings not paid within X days)
 */
export const cancelOverduePendingBookings = async (daysLimit = 7) => {
  try {
    console.log("🔄 Checking for overdue pending bookings...");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysLimit);

    const overdueBookings = await Booking.find({
      bookingStatus: "pending",
      paymentStatus: "unpaid",
      createdAt: { $lte: cutoffDate }
    }).populate("user vehicle");

    console.log(`Found ${overdueBookings.length} overdue pending bookings`);

    for (const booking of overdueBookings) {
      booking.bookingStatus = "cancelled";
      await booking.save();

      // Notify user
      try {
        const vehicleInfo = booking.vehicle?.title || booking.vehicle?.model || "Vehicle";
        
        await sendEmail(
          booking.user.email,
          "Your Booking Was Cancelled",
          `
            <h2>Booking Cancelled</h2>
            <p>Your unpaid booking for <b>${vehicleInfo}</b> has been automatically cancelled.</p>
            <p><b>Reason:</b> Payment was not completed within ${daysLimit} days.</p>
            <p>You can make a new booking anytime.</p>
          `
        );
      } catch (emailError) {
        console.warn(`⚠️ Failed to send cancellation email: ${emailError.message}`);
      }
    }

    console.log(`✅ Cancelled ${overdueBookings.length} overdue bookings`);
    return overdueBookings.length;
  } catch (error) {
    console.error("❌ Cancel overdue bookings error:", error.message);
  }
};
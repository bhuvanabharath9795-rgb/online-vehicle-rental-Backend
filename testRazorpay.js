import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
});

try {
  const order = await razorpay.orders.create({
    amount: 100,
    currency: "INR",
    receipt: "test_receipt_1"
  });

  console.log("Razorpay working:", order);
} catch (error) {
  console.log("Razorpay failed:", error);
}
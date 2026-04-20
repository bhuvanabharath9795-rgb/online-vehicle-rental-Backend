import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

console.log("Razorpay Key ID:", key_id);
console.log("Razorpay Secret Length:", key_secret.length);

const razorpay = new Razorpay({
  key_id,
  key_secret
});

export default razorpay;
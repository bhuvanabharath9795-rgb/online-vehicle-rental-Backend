import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();



const razorpay = new Razorpay({
  key_id,
  key_secret
});

export default razorpay;
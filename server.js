import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";
import app from "./src/app.js";

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;


dns.setServers(["1.1.1.1", "8.8.8.8"]);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB database...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

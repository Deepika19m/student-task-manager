import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("Set MONGODB_URI and JWT_SECRET in your environment before starting the server.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`CampusCare API is running on http://localhost:${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}

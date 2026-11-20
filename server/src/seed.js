import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Complaint, { CATEGORIES } from "./models/Complaint.js";

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI in your environment before running the seed script.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const adminEmail = (process.env.ADMIN_EMAIL || "admin@campus.edu").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "CampusAdmin123!";
const studentEmail = "student@campus.edu";
const studentPassword = "Student123!";

const admin = await User.findOneAndUpdate(
  { email: adminEmail },
  {
    $set: {
      name: "Campus Administrator",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "admin",
    },
  },
  { upsert: true, new: true, runValidators: true }
);
const student = await User.findOneAndUpdate(
  { email: studentEmail },
  {
    $setOnInsert: {
      name: "Jordan Lee",
      email: studentEmail,
      passwordHash: await bcrypt.hash(studentPassword, 12),
      role: "student",
      department: "Computer Science",
    },
  },
  { upsert: true, new: true, runValidators: true }
);

if ((await Complaint.countDocuments()) === 0) {
  const examples = [
    ["CC-2026-7A31C2", "Lighting in the east library study area has been out for several evenings.", "Facilities", "Pending", new Date()],
    ["CC-2026-9B40D1", "The Wi-Fi connection in the engineering building drops during lectures.", "Technology", "In Progress", new Date(Date.now() - 86400000)],
    ["CC-2026-2E65F8", "Could we have clearer communication about the updated exam timetable?", "Academics", "Resolved", new Date(Date.now() - 2 * 86400000)],
    ["CC-2026-4D18A6", "The shuttle stop by the north residence is not listed on the route map.", "Transportation", "Pending", new Date(Date.now() - 4 * 86400000)],
  ];
  await Complaint.insertMany(
    examples.map(([id, description, category, status, createdAt], index) => ({
      complaintId: id,
      student: student._id,
      studentName: student.name,
      department: index === 2 ? "Business" : student.department,
      category: CATEGORIES.includes(category) ? category : "Other",
      description,
      status,
      createdAt,
      updatedAt: createdAt,
    }))
  );
}

console.log(`Seed complete.\nAdmin: ${admin.email} / ${adminPassword}\nStudent: ${studentEmail} / ${studentPassword}`);
await mongoose.disconnect();

import mongoose from "mongoose";

export const DEPARTMENTS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Arts & Humanities",
  "Health Sciences",
  "Student Affairs",
  "Other",
];

export const CATEGORIES = [
  "Facilities",
  "Academics",
  "Technology",
  "Campus Safety",
  "Transportation",
  "Student Services",
];

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    department: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);

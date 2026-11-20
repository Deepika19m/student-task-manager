import { Router } from "express";
import { randomBytes } from "node:crypto";
import Complaint, { CATEGORIES, DEPARTMENTS } from "../models/Complaint.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
const STATUSES = ["Pending", "In Progress", "Resolved"];
const complaintId = () => `CC-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

router.use(authenticate);

router.get("/stats", requireRole("admin"), async (req, res, next) => {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
    ]);
    res.json({ total, pending, inProgress, resolved });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const filter = req.user.role === "student" ? { student: req.user.id } : {};
    if (req.user.role === "admin") {
      if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
      if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
    }
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      filter.complaintId = { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ complaints });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireRole("student"), async (req, res, next) => {
  try {
    const { studentName, department, category, description } = req.body;
    if (typeof studentName !== "string" || studentName.trim().length < 2 || studentName.trim().length > 80) {
      return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    }
    if (!DEPARTMENTS.includes(department)) return res.status(400).json({ message: "Choose a valid department." });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: "Choose a valid complaint category." });
    if (typeof description !== "string" || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({ message: "Description must be between 10 and 2,000 characters." });
    }

    const complaint = await Complaint.create({
      complaintId: complaintId(),
      student: req.user.id,
      studentName: studentName.trim(),
      department,
      category,
      description: description.trim(),
    });
    res.status(201).json({ complaint });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", requireRole("admin"), async (req, res, next) => {
  try {
    if (!STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Choose a valid complaint status." });
    }
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json({ complaint });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json({ message: "Complaint deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;

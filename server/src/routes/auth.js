import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { DEPARTMENTS } from "../models/Complaint.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || "",
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Your password must be at least 8 characters." });
    }
    if (!DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Choose a valid department." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: "student",
      department,
    });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!["student", "admin"].includes(role) || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Enter your email and password." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));
    if (!passwordMatches || user.role !== role) {
      return res.status(401).json({ message: `Those ${role} sign-in details don't match our records.` });
    }
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;

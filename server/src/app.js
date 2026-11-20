import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

if (process.env.NODE_ENV === "production") {
  const clientBuild = path.resolve(currentDir, "../../dist");
  app.use(express.static(clientBuild));
  app.get("*", (req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ message: "The requested resource was not found." }));
app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ message: "That record already exists. Please try again." });
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Some information was invalid. Please check and try again." });
  }
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again shortly." });
});

export default app;

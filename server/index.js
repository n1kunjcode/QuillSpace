const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ===== security =====
app.use(helmet());

// Rate limit: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Auth endpoints get a tighter limit (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
});
app.use("/api/auth/", authLimiter);

// ===== middleware =====
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// ===== database =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ===== routes =====
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const folderRoutes = require("./routes/folders");
app.use("/api/folders", folderRoutes);

const noteRoutes = require("./routes/notes");
app.use("/api/notes", noteRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// ===== health check =====
app.get("/", (req, res) => res.json({ status: "ok", app: "QuillSpace API" }));

// ===== start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

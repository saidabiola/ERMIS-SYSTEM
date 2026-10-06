require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const recordRoutes = require("./routes/records");
const ictRoutes = require("./routes/ict");
const auditRoutes = require("./routes/audit");
const approvalRoutes = require("./routes/approvals");

const app = express();

// Behind Docker/nginx/Caddy TLS termination — needed for secure cookies & correct protocol
app.set("trust proxy", 1);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Files are NOT public — download only via GET /api/records/:id/file (auth + approval rules)

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/ict", ictRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/approvals", approvalRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Ermis Backend, Testing API...");
});

app.get("/api/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    db: dbReady ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    // Drop old schoolCode-only unique index; apply compound schoolCode+year
    const Record = require("./models/Record");
    await Record.syncIndexes();
    console.log("Record indexes synced...");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "If using MongoDB Atlas, whitelist this machine's IP (Network Access), then restart the server."
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
}

start();

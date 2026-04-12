require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const caseRoutes = require("./routes/caseRoutes");
const documentRoutes = require("./routes/documentRoutes");
const hearingRoutes = require("./routes/hearingRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRequestRoutes = require("./routes/adminRequestRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { startReminders } = require("./cron/reminders");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
startReminders();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Legal Case Management System API",
    status: "running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/hearings", hearingRoutes);
app.use("/api/timelines", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin-requests", adminRequestRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

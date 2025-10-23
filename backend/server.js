const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");  
dotenv.config(); // Load .env variables

const app = express();

// Middleware to handle cors
app.use(
  cors({
    origin: process.env.Client_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use("/api/users",userRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/reports",reportRoutes);
// Routes
app.use("/api/auth",authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

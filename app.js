const express = require("express");
const connectDB = require("./config/db");
const rateLimiter = require("./middleware/rateLimiter");


const app = express();
// Apply globally
app.use(rateLimiter);
// Middleware
app.use(express.json());
app.use(express.json());   // ✅ MUST be present
// 🔹 Connect Database
connectDB();

// 🔹 Routes
const songRoutes = require("./routes/song");
app.use("/api/songs", songRoutes);

// 🔹 Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
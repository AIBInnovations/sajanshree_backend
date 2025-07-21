require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sajan-shree-frontend-bu8g.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all localhost ports
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions)); // Enables CORS for frontend communication
app.use(morgan("dev")); // Logs requests for debugging

// Sample route
app.get("/", (req, res) => {
  res.send("Sajan Shree Order Management API is running...");
});

// Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const Order = require("./models/orderModel");
const User = require("./models/userModel");

// Test MongoDB connection with a sample query
const testDB = async () => {
  try {
    const orders = await Order.find();
    console.log("Orders in database:", orders.length);
  } catch (error) {
    console.error("Database test failed:", error);
  }
};

testDB();

const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

// Use Routes
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();

const errorHandler = require("./middleware/errorMiddleware");

// Use Routes
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Error Handling Middleware (should be after routes)
app.use(errorHandler);

require("./utils/cronJobs"); // Import and start cron jobs

// ==============================================================================
// Express Application Setup (app.js)
// ==============================================================================
// This file initializes the Express app and registers all global middleware,
// routes, and error handling.
// It DOES NOT start the server on a port (server.js does that).

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const organisationRoutes = require("./routes/organisationRoutes");

const app = express();

// ------------------------------------------------------------------------------
// Global Middlewares
// ------------------------------------------------------------------------------

// 1. CORS (Cross-Origin Resource Sharing):
// Allows our React frontend (Vite ports 5173, 5174, etc.) to send cookies and make API requests.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === origin) {
      return callback(null, true);
    }
    return callback(new Error("CORS error: Origin not allowed"), false);
  },
  credentials: true
}));

// 2. Cookie Parser:
// Parses incoming cookies so we can read `req.cookies.token` in our auth middleware.
app.use(cookieParser());

// 3. Body Parsers:
// Parses incoming JSON payloads so we can read `req.body` in controllers.
app.use(express.json());
// Parses URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/organisations", organisationRoutes);

// ------------------------------------------------------------------------------
// Health Check Route (Used to verify backend and database connection)
// ------------------------------------------------------------------------------
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    message: "Campus Pulse API is up and running!",
    database: isDbConnected ? "Connected to MongoDB Atlas" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------------------------
// 404 Handler for Undefined Routes
// ------------------------------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ------------------------------------------------------------------------------
// Central Error Handling Middleware
// ------------------------------------------------------------------------------
// Express recognizes this as an error handler because it has 4 parameters: (err, req, res, next).
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;

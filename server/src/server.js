// ==============================================================================
// Server Entry Point (server.js)
// ==============================================================================
// This file is the main executable file for the backend.
// It loads environment variables, connects to the database, and starts listening on the port.

// 1. Load environment variables from .env
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

// Set port from environment variable, fallback to 5050 if not specified
const PORT = process.env.PORT || 5050;

/**
 * Start the HTTP server after connecting to database.
 */
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  // Start listening for incoming requests
  app.listen(PORT, () => {
    console.log(` Campus Pulse Server running on: http://localhost:${PORT}`);
    console.log(` Health check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();

// ==============================================================================
// Database Configuration (MongoDB Atlas Connection via Mongoose)
// ==============================================================================
// This file connects our Express backend to our MongoDB database.
// We use Mongoose, which is an Object Data Modeling (ODM) library for MongoDB.

const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas using the URI from environment variables (.env).
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri === "your_mongodb_connection_string") {
      console.warn("⚠️ Warning: MONGO_URI is not configured yet in .env file.");
      console.warn("⚠️ Database connection skipped for now until a valid URI is provided.");
      return;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure code if database fails to connect
    process.exit(1);
  }
};

module.exports = connectDB;

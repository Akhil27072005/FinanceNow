const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string from environment variables
 * Handles connection errors and successful connection logging
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are recommended for Mongoose 6+
      // Remove useNewUrlParser and useUnifiedTopology as they're default in Mongoose 6+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;


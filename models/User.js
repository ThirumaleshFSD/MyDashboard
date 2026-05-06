const mongoose = require("mongoose");

// Define what a User looks like in the database
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,       // No two users with the same email
    lowercase: true,    // Always store email in lowercase
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now   // Automatically save the signup time
  }
});

// Export the model so server.js can use it
module.exports = mongoose.model("User", userSchema);

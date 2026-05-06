const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Parse JSON bodies sent from the frontend (fetch API sends JSON)
app.use(express.json());
// Parse URL-encoded form data (traditional HTML form POST)
app.use(express.urlencoded({ extended: true }));
// Serve everything inside the /public folder as static files
app.use(express.static(path.join(__dirname, "public")));


// ─── Page Routes ─────────────────────────────────────────────────────────────
// Open http://localhost:4000  →  shows login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Open http://localhost:4000/dashboard  →  shows dashboard.html
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});


// ─── API: Register (Save user to MongoDB) ────────────────────────────────────
// Frontend calls: POST /api/register  with { email, password }
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // 2. Hash the password before saving (never store plain passwords!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create and save the new user in MongoDB
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Registered successfully!" });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
});


// ─── API: Login (Check credentials against MongoDB) ──────────────────────────
// Frontend calls: POST /api/login  with { email, password }
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found. Please register first." });
    }

    // 2. Compare entered password with the hashed one stored in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // 3. Success — send back the user's email so dashboard can display it
    res.status(200).json({ message: "Login successful!", email: user.email });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
});


// ─── MongoDB Connection + Start Server ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(4000, () => {
      console.log("🚀 Server running on http://localhost:4000");
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
  });

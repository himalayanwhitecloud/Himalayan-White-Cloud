// ---------------------------
// IMPORTS
// ---------------------------
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // serve HTML/CSS/JS

// ---------------------------
// IN-MEMORY DATABASE
// ---------------------------
const users = [
  // Default admin account
  {
    email: "admin@hwc.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin"
  },
  {
    email: "customer@hwc.com",
    password: "Customer123!",
    role: "customer"
  }
];

// Bookings will be stored here

const bookings = []; // <- IMPORTANT


// JWT Secret
const JWT_SECRET = "supersecretkeychangeit";


// ---------------------------
// HELPER: AUTH MIDDLEWARE
// ---------------------------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, message: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}


// ---------------------------
// USER REGISTRATION
// ---------------------------
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ email, passwordHash, role: "user" });

  res.json({ success: true, message: "Registered successfully" });
});


// ---------------------------
// LOGIN
// ---------------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ success: true, token });
});


// ---------------------------
// PROFILE ROUTE (requires login)
// ---------------------------
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    email: req.user.email,
    role: req.user.role
  });
});


// ---------------------------
// BOOK A CONSULTATION (PUBLIC)
// ---------------------------
app.post("/api/booking", (req, res) => {
  const { fullName, phone, email, service, date, time, notes } = req.body;

  if (!fullName || !phone || !email || !date || !time) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const booking = {
    id: bookings.length + 1,
    fullName,
    phone,
    email,
    service,
    date,
    time,
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  console.log("New booking:", booking);

  res.json({ success: true, message: "Booking saved", booking });
});


// ---------------------------
// FETCH ALL BOOKINGS (ADMIN ONLY)
// ---------------------------
app.get("/api/bookings", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  res.json({ success: true, bookings });
});


// ---------------------------
// START SERVER
// ---------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  // check if email already exists
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // store in “database”
  users.push({ email, passwordHash });

  res.json({ success: true, message: "User registered successfully" });
});

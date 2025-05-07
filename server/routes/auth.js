const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { name, email, password, phone, student_id, birthday } = req.body;

  if (!name || !email || !password || !student_id || !birthday) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      student_id,
      birthday,
      phone,
      balance: 200,
      reputation: 0
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'SequelizeValidationError') {
      const validationError = err.errors.find(error => error.path === 'email');
      if (validationError) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Password or email is incorrect!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password or email is incorrect!" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res
      .cookie("token", token, { httpOnly: true, secure: false, sameSite: "Lax" })
      .json({ message: "Login successful", user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax", // prod'da "strict" olabilir
      secure: false // prod ortamda true olmalı
    });
    res.status(200).json({ message: "Logged out successfully" });
  });

router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

  

module.exports = router;

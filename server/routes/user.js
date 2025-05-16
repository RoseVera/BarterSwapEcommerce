const express = require("express");
const router = express.Router();
const pool = require("../db");
const User = require("../models/User");  

router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'reputation']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, student_id, phone } = req.body;

  try {
    await pool.query(
      `UPDATE users SET name = $1, student_id = $2, phone = $3 WHERE id = $4`,
      [name, student_id, phone, id]
    );
    res.json({ message: "User information updated successfully." });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

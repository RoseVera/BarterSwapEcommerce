const express = require("express");
const router = express.Router();
const Follower = require("../models/Follower");
const User = require("../models/User");  


router.post("/", async (req, res) => {
  const { follower_id, followed_id } = req.body;
  if (!follower_id || !followed_id) return res.status(400).json({ message: "Invalid data." });
  if (follower_id === followed_id) return res.status(400).json({ message: "Cannot follow yourself." });

  try {
    const existing = await Follower.findOne({ where: { follower_id, followed_id } });
    if (existing) return res.status(400).json({ message: "Already following." });

    await Follower.create({ follower_id, followed_id });
    res.json({ message: "Followed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Follower.count({ where: { followed_id: req.params.userId } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/followers/is-following?follower_id=1&followed_id=2
router.get("/is-following", async (req, res) => {
    const { follower_id, followed_id } = req.query;
  
    if (!follower_id || !followed_id) return res.status(400).json({ message: "Invalid query parameters." });
  
    try {
      const existing = await Follower.findOne({ where: { follower_id, followed_id } });
      res.json({ isFollowing: !!existing });
    } catch (err) {
      res.status(500).json({ message: "Internal server error." });
    }
  });

  // GET /api/followers/followed/:followerId
  router.get("/followed/:followerId", async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      const { count, rows } = await Follower.findAndCountAll({
        where: { follower_id: req.params.followerId },
        include: [{ model: User, as: "followed", attributes: ["id", "name"] }],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
  
      const followedUsers = rows.map(f => f.followed);
  
      res.json({
        followedUsers,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (err) {
      console.error("Followed users fetch error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  

  
// DELETE /api/followers
router.delete("/", async (req, res) => {
    const { follower_id, followed_id } = req.body;
  
    if (!follower_id || !followed_id) return res.status(400).json({ message: "Invalid data." });
  
    try {
      const deleted = await Follower.destroy({ where: { follower_id, followed_id } });
  
      if (deleted) {
        res.json({ message: "Unfollowed successfully." });
      } else {
        res.status(404).json({ message: "Follow relationship not found." });
      }
    } catch (err) {
      res.status(500).json({ message: "Internal server error." });
    }
  });
  
module.exports = router;

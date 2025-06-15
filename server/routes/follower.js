const express = require("express");
const router = express.Router();
const Follower = require("../models/Follower");
const User = require("../models/User");
const sequelize = require('../sequelize');

router.post("/", async (req, res) => {
  const { follower_id, followed_id } = req.body;
  if (!follower_id || !followed_id) return res.status(400).json({ message: "Invalid data." });
  if (follower_id === followed_id) return res.status(400).json({ message: "Cannot follow yourself." });

  try {
    const existing = await Follower.findOne({ where: { follower_id, followed_id } }); //It uses index
    if (existing) return res.status(400).json({ message: "Already following." });

    await Follower.create({ follower_id, followed_id });
    res.json({ message: "Followed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/count/:userId", async (req, res) => {
  try {
    const count = await Follower.count({ where: { followed_id: req.params.userId } }); //it uses idx_followed_id as index
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/is-following", async (req, res) => {
  const { follower_id, followed_id } = req.query;

  if (!follower_id || !followed_id) return res.status(400).json({ message: "Invalid query parameters." });

  try {
    const existing = await Follower.findOne({ where: { follower_id, followed_id } }); //it uses followers_follower_id_followed_id_key
    res.json({ isFollowing: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/followed/:followerId", async (req, res) => {
  const { cursor, limit = 5 } = req.query;

  let whereClause = `f.follower_id = :followerId`;
  const replacements = {
    followerId: req.params.followerId,
    limit: parseInt(limit),
  };

  if (cursor) {
    const [cursorCreatedAt, cursorId] = cursor.split("_");
    whereClause += ` AND (f."createdAt" < :cursorCreatedAt OR (f."createdAt" = :cursorCreatedAt AND f.followed_id < :cursorId))`;
    replacements.cursorCreatedAt = new Date(cursorCreatedAt);
    replacements.cursorId = parseInt(cursorId);
  }

  const sql = `
    SELECT u.id, u.name, f."createdAt", f.followed_id
    FROM followers f
    JOIN users u ON f.followed_id = u.id
    WHERE ${whereClause}
    ORDER BY f."createdAt" DESC, f.followed_id DESC
    LIMIT :limit
  `;

  try {
    const results = await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const nextCursor = results.length
      ? `${results[results.length - 1].createdAt.toISOString()}_${results[results.length - 1].followed_id}`
      : null;

    res.json({
      followedUsers: results.map(r => ({ id: r.id, name: r.name })),
      nextCursor,
      hasMore: !!nextCursor,
    });
  } catch (err) {
    console.error("Following fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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

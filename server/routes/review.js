const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Review = require("../models/Review");
const Transaction = require("../models/Transaction");
const Item = require("../models/Item");
const User = require("../models/User");
const Bonus = require("../models/Bonus");

const pool = require("../db");

router.get("/reputation/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT ROUND(AVG(r.rating), 2) AS reputation
       FROM reviews r
       JOIN transactions t ON r.transaction_id = t.id
       WHERE t.seller_id = $1`,
      [id]
    );
    res.json({ reputation: result.rows[0].reputation || 0 });
  } catch (err) {
    console.error("Error fetching reputation:", err);
    res.status(500).json({ error: "Failed to fetch reputation" });
  }
});

// GET /api/reviews/user/:userId
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { cursor, limit = 10 } = req.query;

  try {
    let where = {
      seller_id: userId,
    };

    if (cursor) {
      const [createdAtCursor, idCursor] = cursor.split("_");
      where = {
        ...where,
        [Op.or]: [
          { createdAt: { [Op.lt]: new Date(createdAtCursor) } },
          {
            createdAt: new Date(createdAtCursor),
            id: { [Op.lt]: idCursor },
          },
        ],
      };
    }
    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Review,
          required: true,
        },
        {
          model: Item,
          attributes: ["title"]
        },
        {
          model: User,
          as: "Buyer",
          attributes: ["name"]
        }
      ],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      limit: +limit
    });

const data = transactions.map(tx => ({
  transactionCreatedAt: tx.createdAt,
  transactionId: tx.id,
  id: tx.Review.id,
  itemTitle: tx.Item?.title || "Unknown Item",
  buyerName: tx.Buyer?.name || "Unknown Buyer",
  review: tx.Review.review,
  rating: tx.Review.rating,
  createdAt: tx.Review.createdAt,
}));

    res.json({
      reviews: data,
     nextCursor: data.length > 0 ? `${data[data.length - 1].transactionCreatedAt.toISOString()}_${data[data.length - 1].transactionId}` : null

    });
    
  } catch (err) {
    console.error("Review fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/reviews.js
router.get("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  try {
    const review = await Review.findOne({ where: { transaction_id: transactionId } });
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: "No review found" });
    }
  } catch (err) {
    console.error("Fetch review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { transaction_id, review, rating } = req.body;

  if (!transaction_id || !rating) {
    return res.status(400).json({ message: "Transaction ID and rating are required" });
  }

  try {
    await pool.query(
      `SELECT add_review($1, $2, $3)`,
      [transaction_id, review, rating]
    );

    res.json({ message: "Review and bonus (if applicable) saved successfully" });
  } catch (err) {
    console.error("add_review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { review, rating } = req.body;

  try {
    const existing = await Review.findOne({ where: { transaction_id: transactionId } });
    if (!existing) return res.status(404).json({ message: "Review not found" });

    await existing.update({ review, rating });
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/reviews/:transactionId
router.delete("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    const review = await Review.findOne({ where: { transaction_id: transactionId } });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

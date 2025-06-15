const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
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

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { cursor, limit = 10 } = req.query;

  try {
    let values = [userId];
    let cursorCondition = "";
    
    if (cursor) {
      const [createdAtCursor, idCursor] = cursor.split("_");
      values.push(createdAtCursor, idCursor);

      cursorCondition = `
        AND (
          t."createdAt" < $2 OR
          (t."createdAt" = $2 AND t.id < $3)
        )
      `;
    }

    const query = `
      SELECT
        t.id AS "transactionId",
        t."createdAt" AS "transactionCreatedAt",
        r.id AS "reviewId",
        r.review,
        r.rating,
        r."createdAt" AS "reviewCreatedAt",
        i.title AS "itemTitle",
        u.name AS "buyerName"
      FROM transactions t
      JOIN reviews r ON t.id = r.transaction_id
      LEFT JOIN items i ON t.item_id = i.id
      LEFT JOIN users u ON t.buyer_id = u.id
      WHERE t.seller_id = $1
      ${cursorCondition}
      ORDER BY t."createdAt" DESC, t.id DESC
      LIMIT ${+limit}
    `;

    const result = await pool.query(query, values);

    const data = result.rows.map(row => ({
      transactionCreatedAt: row.transactionCreatedAt,
      transactionId: row.transactionId,
      id: row.reviewId,
      itemTitle: row.itemTitle || "Unknown Item",
      buyerName: row.buyerName || "Unknown Buyer",
      review: row.review,
      rating: row.rating,
      createdAt: row.reviewCreatedAt
    }));

    res.json({
      reviews: data,
      nextCursor:
        data.length > 0
          ? `${data[data.length - 1].transactionCreatedAt.toISOString()}_${data[data.length - 1].transactionId}`
          : null
    });

  } catch (err) {
    console.error("Review fetch error (raw):", err);
    res.status(500).json({ message: "Server error" });
  }
});

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
    const existing = await Review.findOne({ 
      where: { transaction_id: transactionId },
     attributes: ["id", "transaction_id", "review", "rating", "createdAt"]
     });
    if (!existing) return res.status(404).json({ message: "Review not found" });

    await existing.update({ review, rating });
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    const review = await Review.findOne({
      where: { transaction_id: transactionId },
      attributes: ["id", "transaction_id", "review", "rating", "createdAt"]
 });
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

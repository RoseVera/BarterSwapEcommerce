const express = require("express");
const router = express.Router();
const pool = require("../db");


router.get("/highest/:item_id", async (req, res) => {
  const { item_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT user_id, bid_amount FROM bids WHERE item_id = $1 ORDER BY bid_amount DESC LIMIT 1`,
      [item_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No bids found for this item" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching highest bid:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sell/:item_id", async (req, res) => {
  const { item_id } = req.params;
  try {
    // En yüksek teklif sahibi
    const highestBidResult = await pool.query(
      `SELECT *  FROM bids WHERE item_id = $1 ORDER BY bid_amount DESC LIMIT 1`,
      [item_id]
    );

    if (highestBidResult.rows.length === 0) {
      return res.status(400).json({ error: "No bids to sell to" });
    }

    const buyer_id = highestBidResult.rows[0].user_id;
    const bid_amount = highestBidResult.rows[0].bid_amount;
    const bid_id = highestBidResult.rows[0].id;

    const balanceResult = await pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [buyer_id]
    );

    const balance = balanceResult.rows[0]?.balance;

    if (balance === undefined) {
      return res.status(400).json({ error: "Buyer not found" });
    }

    // Balance Control
    if (balance < bid_amount) {
      // Delete highest bid 
      await pool.query(`DELETE FROM bids WHERE id = $1`, [bid_id]);

      // Is there next highest bid?
      const nextBidResult = await pool.query(
        `SELECT bid_amount FROM bids WHERE item_id = $1 ORDER BY bid_amount DESC LIMIT 1`,
        [item_id]
      );

      if (nextBidResult.rows.length > 0) {
        const nextBidAmount = nextBidResult.rows[0].bid_amount;

        // update item current price
        await pool.query(
          `UPDATE items SET current_price = $1 WHERE id = $2`,
          [nextBidAmount, item_id]
        );
      } else {
        // If no bid, current price is null
        await pool.query(
          `UPDATE items SET current_price = NULL WHERE id = $1`,
          [item_id]
        );
      }

      return res.status(400).json({
        error: "Buyer's balance is insufficient. Highest bid removed.",
      });
    }

    // Purchase Function
    const purchaseResult = await pool.query(
      `SELECT purchase_item($1, $2)`,
      [buyer_id, item_id]
    );

    res.json({ message: purchaseResult.rows[0].purchase_item });
  } catch (err) {
    console.error("Sell failed:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

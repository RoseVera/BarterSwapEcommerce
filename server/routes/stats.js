const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/monthly-bonuses/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await pool.query(`
            SELECT date_trunc('month', "createdAt") AS month,
                    SUM(amount) AS total_bonus
            FROM bonuses
            WHERE user_id = $1
                AND "createdAt" >= NOW() - INTERVAL '11 months'
            GROUP BY month
            ORDER BY month ASC
        `, [userId]);

        res.json(result.rows);
        console.log(result.rows)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/monthly-purchases/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await pool.query(`
            SELECT date_trunc('month', "createdAt") AS month,
                    COUNT(*) AS items_bought,
                    SUM(price) AS total_spent
            FROM transactions
            WHERE buyer_id = $1
                AND "createdAt" >= NOW() - INTERVAL '11 months'
            GROUP BY month
            ORDER BY month ASC
        `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/monthly-sales/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const result = await pool.query(`
        SELECT date_trunc('month', "createdAt") AS month,
                    COUNT(*) AS items_sold,
                    SUM(price) AS total_earned
            FROM transactions
            WHERE seller_id = $1
                AND "createdAt" >= NOW() - INTERVAL '11 months'
            GROUP BY month
            ORDER BY month ASC
        `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;

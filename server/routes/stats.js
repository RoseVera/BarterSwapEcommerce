const express = require("express");
const router = express.Router();
const { Op, fn, col, literal } = require("sequelize");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const Bonus = require("../models/Bonus");

router.get("/monthly-bonuses/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const oneYearAgo = new Date();
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
        oneYearAgo.setDate(1);
        oneYearAgo.setHours(0, 0, 0, 0);

        const bonuses = await Bonus.findAll({
            where: {
                user_id: userId,
                createdAt: {
                    [Op.gte]: oneYearAgo,
                },
                type: {
                    [Op.in]: ["BONUS", "REWARD"]
                }
            },
            attributes: [
                [fn("date_trunc", "month", col("createdAt")), "month"],
                [fn("SUM", col("amount")), "total_bonus"]
            ],
            group: [literal("month")],
            order: [[literal("month"), "ASC"]],
        });

        res.json(bonuses);
        console.log(bonuses)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/monthly-purchases/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const oneYearAgo = new Date();
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
        oneYearAgo.setDate(1);
        oneYearAgo.setHours(0, 0, 0, 0);

        const purchases = await Transaction.findAll({
            where: {
                buyer_id: userId,
                createdAt: {
                    [Op.gte]: oneYearAgo,
                }
            },
            attributes: [
                [fn("date_trunc", "month", col("createdAt")), "month"],
                [fn("COUNT", col("id")), "items_bought"],
                [fn("SUM", col("price")), "total_spent"]
            ],
            group: [literal("month")],
            order: [[literal("month"), "ASC"]],
        });

        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /stats/monthly-sales/:userId
router.get("/monthly-sales/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const items = await Item.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
                [fn('COUNT', '*'), 'items_sold'],
                [
                    fn('SUM', literal(`CASE 
            WHEN "is_bid" = true THEN "current_price" 
            ELSE "starting_price" END`)), 'total_earned'
                ]
            ],
            where: {
                user_id: userId,
                is_active: false,
                createdAt: {
                    [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                }
            },
            group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
            order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']]
        });

        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;

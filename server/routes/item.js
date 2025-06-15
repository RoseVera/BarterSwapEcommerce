const express = require("express");
const Item = require("../models/Item");
const User = require("../models/User");
const { ensureAuth } = require('../middleware/auth');
const sequelize = require('../sequelize');
const router = express.Router();
const { QueryTypes } = require("sequelize");
const pool = require("../db");

router.post("/", async (req, res) => {
  const { user_id, title, description, category, starting_price, image, condition, is_bid } = req.body;
  if (!user_id || !title || !category || !starting_price || !condition) {

    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const newItem = await Item.create({
      user_id,
      title,
      description,
      category,
      starting_price,
      current_price: null,
      image,
      condition,
      is_bid
    });

    res.status(201).json({
      message: "Item created successfully",
      item: newItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/:id/purchase', ensureAuth, async (req, res) => {
  const buyerId = req.user.id;
  const itemId = req.params.id;

  try {
    const item = await Item.findOne({
      where: { id: itemId },
      attributes: ['user_id', 'is_bid']
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.user_id === buyerId) {
      return res.status(400).json({ message: "You can't purchase your own item" });
    }
    if (item.is_bid) {
      return res.status(400).json({ message: "This item is for bidding only" });
    }

    // Satın alma işlemini fonksiyonla yap
    const result = await sequelize.query(
      'SELECT purchase_item(:buyer_id, :item_id) AS result',
      {
        replacements: { buyer_id: buyerId, item_id: itemId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({ message: result[0].result });

  } catch (err) {
    console.error('Purchase error:', err);
    if (err.message.includes('Buyer balance is insufficient')) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/bid', ensureAuth, async (req, res) => {
  const userId = req.user.id;
  const itemId = parseInt(req.params.id);
  const { bidAmount } = req.body;

  if (!bidAmount || isNaN(bidAmount)) {
    return res.status(400).json({ message: "Bid amount must be a valid number" });
  }

  try {
    // Get item and its owner
     const item = await Item.findOne({
      where: { id: itemId },
      attributes: ['is_bid']
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.is_bid) {
      return res.status(400).json({ message: "This item is not open for bidding" });
    }

    // Call the Postgres function
    const result = await sequelize.query(
      'SELECT place_bid(:user_id, :item_id, :bid_amount)',
      {
        replacements: {
          user_id: userId,
          item_id: itemId,
          bid_amount: bidAmount
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({ message: result[0].place_bid }); // "Bid placed successfully" veya "Bid failed"

  } catch (err) {
    console.error('Bid error:', err);

    if (err.message.includes('Bid must be higher')) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// for user profile
router.get("/myItems", async (req, res) => {
  const { user_id, is_bid, cursor, limit = 10 } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id" });
  }

  const replacements = { user_id, limit: parseInt(limit) };
  let whereClause = `WHERE i.user_id = :user_id AND i.is_active = true`;

  if (is_bid === "true") {
    whereClause += ` AND i.is_bid = true`;
  } else if (is_bid === "false") {
    whereClause += ` AND i.is_bid = false`;
  }

  if (cursor) {
    whereClause += ` AND i."createdAt" < :cursor`;
    replacements.cursor = cursor;
  }

  const sql = `
    SELECT i.*
    FROM items i
    ${whereClause}
    ORDER BY i."createdAt" DESC
    LIMIT :limit
  `;

  try {
    const items = await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt : null;

    res.json({
      items,
      nextCursor,
      hasMore: items.length === parseInt(limit),
    });
  } catch (err) {
    console.error("Cursor pagination fetch error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

//for homepage
router.get("/filtered-items", async (req, res) => {
  const {
    cursor,
    limit = 15,
    is_bid,
    category,
    condition,
    min_price,
    max_price
  } = req.query;

  const values = [];
  let whereClauses = [`is_active = true`];
  if (is_bid === "true") {
    whereClauses.push(`is_bid = true`);
  } else if (is_bid === "false") {
    whereClauses.push(`is_bid = false`);
  }

  if (category) {
    values.push(category);
    whereClauses.push(`category = $${values.length}`);
  }

  if (condition) {
    values.push(condition);
    whereClauses.push(`condition = $${values.length}`);
  }

  if (min_price) {
    values.push(parseInt(min_price));
    whereClauses.push(`starting_price >= $${values.length}`);
  }

  if (max_price) {
    values.push(parseInt(max_price));
    whereClauses.push(`starting_price <= $${values.length}`);
  }

  if (cursor) {
    const [createdAtCursor, idCursor] = cursor.split("_");
    values.push(createdAtCursor);
    values.push(idCursor);
    whereClauses.push(`("createdAt" < $${values.length - 1} OR ("createdAt" = $${values.length - 1} AND id < $${values.length}))`);
  }

  values.push(parseInt(limit));

  const sql = `
    SELECT *
    FROM items
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY "createdAt" DESC, id DESC
    LIMIT $${values.length}
  `;

  try {
    const items = await sequelize.query(sql, {
      bind: values,
      type: QueryTypes.SELECT
    });

    const nextCursor = items.length > 0
      ? `${items[items.length - 1].createdAt.toISOString()}_${items[items.length - 1].id}`
      : null;
    res.json({
      items,
      nextCursor
    });
  } catch (err) {
    console.error("Raw SQL filtered-items error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// for user page
router.get("/user-items", async (req, res) => {
  const { userId, cursor } = req.query;
  const limit = 12;

  try {
    let values = [userId];
    let cursorCondition = "";

    if (cursor) {
      const [createdAtCursor, idCursor] = cursor.split("_");
      values.push(createdAtCursor, idCursor);

      cursorCondition = `
        AND (
          i."createdAt" < $2 OR
          (i."createdAt" = $2 AND i.id < $3)
        )
      `;
    }

    // LIMIT ifadesi query string'e doğrudan yazıldığı için değer kontrolü yapılıyor
    const query = `
      SELECT i.*
      FROM items i
      WHERE i.user_id = $1 AND i.is_active = true
      ${cursorCondition}
      ORDER BY i."createdAt" DESC, i.id DESC
      LIMIT ${+limit}
    `;

    const result = await pool.query(query, values);
    const items = result.rows;

    const lastItem = items[items.length - 1];
    const nextCursor = items.length === limit
      ? `${new Date(lastItem.createdAt).toISOString()}_${lastItem.id}`
      : null;

    res.json({ items, nextCursor });
  } catch (err) {
    console.error("User items fetch error (raw):", err);
    res.status(500).json({ message: "Server error" });
  }
});

//for user profile
router.get("/purchased-items", async (req, res) => {
  const { userId, cursor } = req.query;
  const limit = 10;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let values = [userId];
  let whereClause = `t.buyer_id = $1`;

  if (cursor) {
    const [cursorDate, cursorId] = cursor.split("_");
    values.push(cursorDate);
    values.push(cursorId);
    whereClause += ` AND (t."createdAt" < $2 OR (t."createdAt" = $2 AND t.id < $3))`;
  }

  values.push(limit);

  const sql = `
    SELECT
      t.id AS transaction_id,
      t."createdAt",
      i.id AS item_id,
      i.title,
      i.is_bid,
      s.id AS seller_id,
      s.name AS seller_name,
      r.review,
      r.rating,
      t.price
    FROM transactions t
    JOIN items i ON i.id = t.item_id
    JOIN users s ON s.id = t.seller_id
    LEFT JOIN reviews r ON r.transaction_id = t.id
    WHERE ${whereClause}
    ORDER BY t."createdAt" DESC, t.id DESC
    LIMIT $${values.length}
  `;

  try {
    const purchases = await sequelize.query(sql, {
      bind: values,
      type: QueryTypes.SELECT
    });

    const nextCursor = purchases.length === limit
      ? `${purchases[purchases.length - 1].createdAt.toISOString()}_${purchases[purchases.length - 1].transaction_id}`
      : null;

    res.json({
      purchases,
      nextCursor
    });
  } catch (err) {
    console.error("Raw SQL purchased-items error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findOne({
      where: { id },
      include: {
        model: User,
        attributes: ['id', 'name'], // İstersen email, image vs de ekleyebilirsin
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const [updated] = await Item.update(updateData, {
      where: { id },
    });

    if (updated) {
      const updatedItem = await Item.findByPk(id);
      return res.status(200).json(updatedItem);
    }

    res.status(404).json({ message: "Item not found" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Item.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ message: "Item deleted successfully" });
    } else {
      return res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Server error while deleting item" });
  }
});

module.exports = router;
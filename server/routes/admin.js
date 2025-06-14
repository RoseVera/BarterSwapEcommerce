const express = require("express");
const router = express.Router();
const { Op, fn, col, Sequelize } = require("sequelize");
const Item = require("../models/Item");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Bid = require("../models/Bid");
const Bonus = require("../models/Bonus");
const pool = require("../db"); // pg pool
const { Parser } = require('json2csv');

//DASHBOARD API

// Top 5 Most Bid Items
router.get("/top-bid-items", async (req, res) => {
  const data = await Bid.findAll({
    attributes: ['item_id', [fn('COUNT', '*'), 'bidCount']],
    include: [{ model: Item, attributes: ['title'] }],
    group: ['item_id', 'Item.id'],
    order: [[fn('COUNT', '*'), 'DESC']],
    limit: 5,  //index:   name: "idx_bids_itemid_bidamount_desc",
  });

  res.json(data.map(b => ({
    itemName: b.Item.title,
    bidCount: b.get('bidCount'),
  })));
});

// Top Sellers by Transaction Count
router.get("/top-sellers", async (req, res) => {
  const data = await Transaction.findAll({
    attributes: ['seller_id', [fn('COUNT', '*'), 'transactionCount']],
    include: [{ model: User, as: 'Seller', attributes: ['name'] }],
    group: ['seller_id', 'Seller.id'],
    order: [[fn('COUNT', '*'), 'DESC']], //index:      name: 'idx_transactions_seller_id',
    limit: 5,
  });

  res.json(data.map(t => ({
    username: t.Seller.name,
    transactionCount: t.get('transactionCount'),
  })));
});

// Monthly Transaction Volume (Last 12 months)
router.get("/monthly-transactions", async (req, res) => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const data = await Transaction.findAll({
    attributes: [
      [fn('to_char', col('createdAt'), 'Mon YYYY'), 'month'],
      [fn('COUNT', '*'), 'transactionCount'],
    ],
    where: {
      createdAt: { [Op.gte]: oneYearAgo },
    },
    group: [
      fn('to_char', col('createdAt'), 'Mon YYYY'),
      fn('DATE_TRUNC', 'month', col('createdAt'))
    ],
    order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']], //index  name: 'idx_transactions_created_at',
    raw: true
  });

  res.json(data.map(row => ({
    month: row.month,
    transactionCount: parseInt(row.transactionCount)
  })));
});

//USERS API

// Get users with cursor pagination
router.get("/users", async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
  const showDeleted = req.query.deleted === "true";

  try {
    let query, values;

    if (cursor) {
      query = `
        SELECT id, name, email, phone, balance
        FROM users
        WHERE id > $1 AND role='USER' AND is_deleted = $2
        ORDER BY id
        LIMIT $3
      `;
      values = [cursor, showDeleted, limit];
    } else {
      query = `
        SELECT id, name, email, phone, balance
        FROM users
        WHERE role='USER' AND is_deleted = $1
        ORDER BY id
        LIMIT $2
      `;
      values = [showDeleted, limit];
    } 

    //index : name: "idx_users_role_deleted_id",
    const result = await pool.query(query, values);

    const totalQuery = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role='USER' AND is_deleted = $1`,
      [showDeleted]
    );
    const total = totalQuery.rows[0].count;

    res.json({
      users: result.rows,
      total: parseInt(total),
      hasMore: result.rows.length === limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Deactivate user
router.patch("/users/:id/:showDeleted", async (req, res) => {
  try {

    if (req.params.showDeleted == 'true') {
      await pool.query("UPDATE users SET is_deleted = FALSE WHERE id = $1", [req.params.id]);
      res.sendStatus(200);
    } else {
      await pool.query("UPDATE users SET is_deleted = TRUE WHERE id = $1", [req.params.id]);
      res.sendStatus(200);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});


//ITEMS API

// Get items with cursor pagination
router.get('/items', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
  const isActive = req.query.active === 'false' ? false : true;

  try {
    const whereClause = {
      is_active: isActive
    };

    if (cursor) {
      whereClause.id = { [Op.gt]: cursor };
    }

    const items = await Item.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      limit
    });

    const total = await Item.count({ where: { is_active: isActive } });

    res.json({
      items,
      total,
      hasMore: items.length === limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not get items' });
  }
});

// Sold item ratio
router.get('/items/sold-ratio', async (req, res) => {
  try {
    const total = await Item.count();
    const sold = await Item.count({ where: { is_active: false } });

    res.json({
      total,
      sold,
      ratio: total > 0 ? (sold / total).toFixed(2) : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not get sold item ratio' });
  }
});

// Number of items by condition
router.get('/items/condition-stats', async (req, res) => {
  const isActive = req.query.active === 'false' ? false : true;

  try {
    const conditions = ['NEW', 'LIKE NEW', 'GOOD', 'ACCEPTABLE', 'BAD'];
    const stats = {};

    for (const condition of conditions) {
      const count = await Item.count({
        where: {
          is_active: isActive,
          condition
        }
      });
      stats[condition] = count;
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not get condition stats' });
  }
});

// Number of items by category
router.get('/items/category-stats', async (req, res) => {
  const isActive = req.query.active === 'false' ? false : true;

  try {
    const categories = [
      'BOOK', 'CLOTHING', 'SHOES', 'TEXTILE', 'STATIONERY',
      'ELECTRONICS', 'TOYS', 'SPORT', 'BEAUTY', 'ART', 'MUSIC',
      'FURNITURE', 'JEWELRY', 'HEALTH', 'OTHER'
    ];
    const stats = {};

    for (const category of categories) {
      const count = await Item.count({
        where: {
          is_active: isActive,
          category
        }
      });
      stats[category] = count;
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not get category stats' });
  }
});


//TRANSACTIONS API
router.get('/transactions', async (req, res) => {
  const { month, type, cursor } = req.query;
  const limit = 100;
  const [year, monthNum] = month.split('-');
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);

  if (type === 'purchase') {
    const where = {
      createdAt: { [Op.between]: [start, end] },
      ...(cursor && { id: { [Op.lt]: cursor } }),
    };

    const txs = await Transaction.findAll({
      where,
      limit,
      order: [['id', 'DESC']], // name: "idx_transaction_createdat_id",
      include: [
        { model: User, as: 'Buyer', attributes: ['name'] },
        { model: User, as: 'Seller', attributes: ['name'] },
        { model: Item, attributes: ['title'] },
      ],
    });

    return res.json({
      transactions: txs.map(tx => ({
        id: tx.id,
        buyerName: tx.Buyer.name,
        sellerName: tx.Seller.name,
        itemName: tx.Item.name,
        price: tx.price,
        createdAt: tx.createdAt,
      })),
      hasMore: txs.length === limit,
      nextCursor: txs.length ? txs[txs.length - 1].id : null,
    });
  } else {

    const typeUpperCase = type.toUpperCase();
    console.log(typeUpperCase)

    const where = {
      type: typeUpperCase,
      createdAt: { [Op.between]: [start, end] },
      ...(cursor && { id: { [Op.lt]: cursor } }),
    };
    const txs = await Bonus.findAll({ //  name: "idx_bonus_type_createdat_id",
      where,
      limit,
      order: [['id', 'DESC']],
      attributes: ['id', 'user_id', 'amount', 'type', 'createdAt'],
      include: [{ model: User, attributes: ['name'] }],
    });


    return res.json({
      transactions: txs.map(b => ({
        id: b.id,
        userName: b.User?.name,
        amount: b.amount,
        type: b.type,
        createdAt: b.createdAt,
      })),
      hasMore: txs.length === limit,
      nextCursor: txs.length ? txs[txs.length - 1].id : null,
    });
  }
});

router.get('/transactions/export', async (req, res) => {
  const { month, type } = req.query;
  const [year, monthNum] = month.split('-');
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);

  let data = [];

  if (type === 'purchase') {
    const txs = await Transaction.findAll({
      where: { createdAt: { [Op.between]: [start, end] } },
      include: [
        { model: User, as: 'Buyer', attributes: ['name'] },
        { model: User, as: 'Seller', attributes: ['name'] },
        { model: Item, attributes: ['title'] },
      ],
    });

    data = txs.map(tx => ({
      Buyer: tx.Buyer.name,
      Seller: tx.Seller.name,
      Item: tx.Item.name,
      Price: tx.price,
      Date: tx.createdAt,
    }));
  } else {
    const txs = await Bonus.findAll({
      where: {
        type: type.toUpperCase(),
        createdAt: { [Op.between]: [start, end] },
      },
      include: [{ model: User, attributes: ['name'] }],
    });

    data = txs.map(b => ({
      User: b.User.name,
      Amount: b.amount,
      Type: b.type,
      Date: b.createdAt,
    }));
  }

  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment('transactions.csv');
  return res.send(csv);
});


module.exports = router;

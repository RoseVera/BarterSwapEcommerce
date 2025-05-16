const express = require("express");
const Item = require("../models/Item"); 
const User = require("../models/User");  
const { ensureAuth } = require('../middleware/auth'); 
const sequelize = require('../sequelize');
const router = express.Router();
const { Op } = require("sequelize");

router.post("/", async (req, res) => {
  const { user_id, title, description, category, starting_price, image, condition, is_bid } = req.body;

  // Verilerin doğruluğunu kontrol et
  if (!user_id || !title || !category || !starting_price || !condition) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    // Yeni item'ı oluştur
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
    const item = await Item.findByPk(itemId, {
      include: { model: User, attributes: ['id'] }
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.User.id === buyerId) {
      return res.status(400).json({ message: "You can't purchase your own item" });
    }
    if (item.is_bid) {
      return res.status(400).json({ message: "This item is for bidding only" });
    }

    // Buyer info
    const buyer = await User.findByPk(buyerId);

    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // Get price
    const price = item.current_price ?? item.starting_price;

    // Balance Control
    if (buyer.balance < price) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Purchase Function
    const result = await sequelize.query(
      'SELECT purchase_item(:buyer_id, :item_id)',
      {
        replacements: { buyer_id: buyerId, item_id: itemId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({ message: result[0].purchase_item }); 

  } catch (err) {
    console.error('Purchase error:', err);
    if (err.message.includes('Insufficient balance')) {
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
    const item = await Item.findByPk(itemId, {
      include: { model: User, attributes: ['id'] }
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

router.get("/", async (req, res) => {
  const { user_id, is_bid } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id" });
  }

  const whereClause = {
    user_id,
    is_active: true,
  };

  if (is_bid === "true") {
    whereClause.is_bid = true;
  } else if (is_bid === "false") {
    whereClause.is_bid = false;
  }

  try {
    const items = await Item.findAll({ where: whereClause });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/latest-items", async (req, res) => {
  try {
    const items = await Item.findAll({
      where: {
        is_active: true
      },
      order: [['createdAt', 'DESC']],
      limit: 15
    });
    res.json(items);
  } catch (err) {
    console.error("Error fetching latest items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/filtered-items", async (req, res) => {
  const {
    page = 1,
    limit = 15,
    is_bid,
    category,
    condition,
    min_price,
    max_price
  } = req.query;

  const offset = (page - 1) * limit;
  const whereClause = {
    is_active: true,
  };

  // Filtre
  if (is_bid === "true") whereClause.is_bid = true;
  else if (is_bid === "false") whereClause.is_bid = false;

  if (category) whereClause.category = category;
  if (condition) whereClause.condition = condition;

  if (min_price || max_price) {
    whereClause.current_price = {};
    if (min_price) whereClause.current_price[Op.gte] = parseInt(min_price);
    if (max_price) whereClause.current_price[Op.lte] = parseInt(max_price);
  }

  try {
    const { rows, count } = await Item.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // newest to oldest
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      items: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Filtered fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user-items", async (req, res) => {
  const {
    userId,
    page = 1,
    limit = 15
  } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const offset = (page - 1) * limit;

  try {
    const { rows, count } = await Item.findAndCountAll({
      where: {
        user_id: userId
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      items: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('User items fetch error:', err);
    res.status(500).json({ message: 'Server error' });
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

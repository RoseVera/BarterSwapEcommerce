const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const pool = require("../db");

router.get("/conversations/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
      /* Composite index for faster user-specific lookups and ordering
        CREATE INDEX idx_conversations_user1_updated_at ON conversations (participant_one_id, updatedAt DESC);
        CREATE INDEX idx_conversations_user2_updated_at ON conversations (participant_two_id, updatedAt DESC);*/

  const query = `
    SELECT 
      c.id,
      c."updatedAt",
      CASE 
        WHEN c.participant_one_id = $1 THEN u2.id
        ELSE u1.id
      END AS user_id,
      CASE 
        WHEN c.participant_one_id = $1 THEN u2.name
        ELSE u1.name
      END AS user_name
    FROM conversations c
    JOIN users u1 ON u1.id = c.participant_one_id
    JOIN users u2 ON u2.id = c.participant_two_id
    WHERE c.participant_one_id = $1 OR c.participant_two_id = $1
    ORDER BY c."updatedAt" DESC
  `;

  try {
    const { rows } = await pool.query(query, [userId]);

    const result = rows.map((row) => ({
      id: row.id,
      user: {
        id: row.user_id,
        name: row.user_name,
      },
      updatedAt: row.updatedat,
    }));

    res.json(result);
  } catch (err) {
    console.error("Conversation fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/messages/:conversationId/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const conversationId = req.params.conversationId;

  try {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }


    /*Composite index for fetching messages of a conversation sorted by time
    CREATE INDEX idx_dm_conversation_created_at ON direct_messages (conversation_id, createdAt ASC); */
    const messages = await DirectMessage.findAll({
      where: { conversation_id: conversationId },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("Message fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/messages", async (req, res) => {
  const { senderId, receiver_id, content } = req.body;
  console.log("req ", req.body);

  if (!receiver_id || !content) {
    return res.status(400).json({ message: "Receiver ID and content required" });
  }

  try {
    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          {
            participant_one_id: senderId,
            participant_two_id: receiver_id,
          },
          {
            participant_one_id: receiver_id,
            participant_two_id: senderId,
          },
        ],
      },
    });

    // If not, create it
    if (!conversation) {
      conversation = await Conversation.create({
        participant_one_id: senderId,
        participant_two_id: receiver_id,
      });
    }

    // Create the message
    const message = await DirectMessage.create({
      sender_id: senderId,
      receiver_id,
      content,
      conversation_id: conversation.id,
    });

    // Update conversation updatedAt
    await conversation.update({ updatedAt: new Date() });

    res.status(201).json(message);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

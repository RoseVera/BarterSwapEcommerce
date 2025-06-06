const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");

// GET /api/dm/conversations
router.get("/conversations/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const conversations = await Conversation.findAll({
      /* Composite index for faster user-specific lookups and ordering
        CREATE INDEX idx_conversations_user1_updated_at ON conversations (participant_one_id, updatedAt DESC);
        CREATE INDEX idx_conversations_user2_updated_at ON conversations (participant_two_id, updatedAt DESC);*/
      where: {
        [Op.or]: [
          { participant_one_id: userId },
          { participant_two_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "ParticipantOne",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "ParticipantTwo",
          attributes: ["id", "name"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const result = conversations.map((conv) => {
      const otherUser =
        conv.participant_one_id === userId ? conv.ParticipantTwo : conv.ParticipantOne;

      console.log("userId", userId)

      console.log(otherUser)
      return {
        id: conv.id,
        user: otherUser,
        updatedAt: conv.updatedAt,
      };
    });


    res.json(result);
  } catch (err) {
    console.error("Conversation fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dm/messages/:conversationId
router.get("/messages/:conversationId/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const conversationId = req.params.conversationId;

  try {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.participant_one_id !== userId && conversation.participant_two_id !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await DirectMessage.findAll({
      /*Composite index for fetching messages of a conversation sorted by time
      CREATE INDEX idx_dm_conversation_created_at ON direct_messages (conversation_id, createdAt ASC); */
      where: { conversation_id: conversationId },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("Message fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/dm/messages
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

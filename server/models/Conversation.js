const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Conversation = sequelize.define("Conversation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  participant_one_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  participant_two_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "conversations",
  timestamps: true, // createdAt and updatedAt 
 indexes: [
    {
      name: "idx_conversations_user1_updated_at",
      fields: [
        "participant_one_id",
        { attribute: "updatedAt", order: "DESC" } 
      ],
    },
    {
      name: "idx_conversations_user2_updated_at",
      fields: [
        "participant_two_id",
        { attribute: "updatedAt", order: "DESC" }
      ],
    }
  ]
});

module.exports = Conversation;

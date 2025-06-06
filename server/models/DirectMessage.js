const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const DirectMessage = sequelize.define("DirectMessage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  }, 
  conversation_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
}

}, {
  tableName: "direct_messages",
  timestamps: true,      
  updatedAt: false,
  indexes: [
  {
    name: "idx_dm_conversation_created_at_asc",
    fields: [
      "conversation_id",
      { attribute: "createdAt", order: "ASC" }
    ]
  }
]
});

module.exports = DirectMessage;

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

}, {
  tableName: "direct_messages",
  timestamps: true,      
  updatedAt: false 
});

module.exports = DirectMessage;

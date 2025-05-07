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
  timestamps: true, // createdAt ve updatedAt için
});

module.exports = Conversation;

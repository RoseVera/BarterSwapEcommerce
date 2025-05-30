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
      fields: ['participant_one_id', 'updatedAt'], // user'ın konuşmalarını updatedAt'e göre çekmek için
    },
    {
      fields: ['participant_two_id', 'updatedAt'], // ikinci kullanıcı için aynı amaç
    }
  ]
});

module.exports = Conversation;

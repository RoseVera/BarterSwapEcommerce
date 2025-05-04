const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Bid = sequelize.define("Bid", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bid_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "bids",
  timestamps: true,      
  updatedAt: false 
});

module.exports = Bid;

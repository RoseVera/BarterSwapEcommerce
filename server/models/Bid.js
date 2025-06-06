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
  updatedAt: false,
  indexes: [
    {
      name: "idx_bids_itemid_bidamount_desc",
      fields: ["item_id", { attribute: "bid_amount", order: "DESC" }],
    }
  ]
});

module.exports = Bid;

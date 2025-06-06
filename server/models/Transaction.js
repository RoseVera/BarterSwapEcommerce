const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: "transactions",
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      name: "idx_transactions_buyer_id",
      fields: ["buyer_id"],
    },
    {
      name: "idx_transaction_buyer_id_created_at",
      fields: ["buyer_id", { attribute: "createdAt", order: "DESC" }],
    },
    {
      name: 'idx_transactions_seller_id',
      fields: ["seller_id"]
    },
    {
      name: 'idx_transactions_created_at',
      fields: ["createdAt"]
    },
     {
    name: "idx_transaction_createdat_id",
    fields: [{ attribute: "createdAt", order: "ASC" }, { attribute: "id", order: "DESC" }],
  }
  ]
});

module.exports = Transaction;

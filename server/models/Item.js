const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(500),
  },
  category: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  starting_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current_price: {
    type: DataTypes.INTEGER,
  },
  image: {
    type: DataTypes.STRING(255),
  },
  condition: {
    type: DataTypes.ENUM("NEW", "LIKE NEW", "GOOD", "ACCEPTABLE", "BAD"),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_bid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "items",
  timestamps: true,      
  updatedAt: false 
});

module.exports = Item;

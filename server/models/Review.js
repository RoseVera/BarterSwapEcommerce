const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  review: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "reviews",
  timestamps: true,      
  updatedAt: false  
});

module.exports = Review;

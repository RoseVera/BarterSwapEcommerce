const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Bonus = sequelize.define("Bonus", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("BONUS", "REWARD"),
    allowNull: false,
  },
}, {
  tableName: "bonuses",
  timestamps: true,      
  updatedAt: false 
});

module.exports = Bonus;

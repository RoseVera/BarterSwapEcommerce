const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Follower = sequelize.define("Follower", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followed_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "followers",
  timestamps: false,
});

module.exports = Follower;

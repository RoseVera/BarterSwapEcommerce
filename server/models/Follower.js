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
  timestamps: true,      
  updatedAt: false,
  indexes: [
    {
      name: "followers_follower_id_followed_id_key",
      unique: true,
      fields: ["follower_id", "followed_id"],
    },
    {
      name: "idx_followed_id",
      fields: ["followed_id"],
    },
    {
      name: "idx_follower_created_at",
      fields: [
        "follower_id",
        { attribute: "createdAt", order: "DESC" },
      ],
    },
  ]
});

module.exports = Follower;

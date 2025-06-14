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
  updatedAt: false,

  indexes: [
    {
      name: "idx_bonuses_user_id_createdAt",
      fields: [
        { attribute: "user_id" },
        { attribute: "createdAt", order: "ASC" }
      ]
    },
    {
      name: "idx_bonus_type_createdat_id",
      fields: [{attribute: "type"}, { attribute: "createdAt", order: "ASC" }, { attribute: "id", order: "DESC" }],
    }
  ]
});

Bonus.associate = (models) => {
  Bonus.belongsTo(models.User, { foreignKey: "user_id" });
};

module.exports = Bonus;

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
    type: DataTypes.ENUM(
      'BOOK', 'CLOTHING', 'SHOES', 'TEXTILE', 'STATIONERY',
      'ELECTRONICS', 'TOYS', 'SPORT', 'BEAUTY', 'ART', 'MUSIC',
      'FURNITURE', 'JEWELRY', 'HEALTH', 'OTHER'
    ),
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
    allowNull: true,

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
  updatedAt: false,
  indexes: [ //PostgreSQL, bir bileşik index’in en başındaki sütunlar varsa, bu index’i hala kullanabilir:
    {
      name: "idx_items_user_id_is_active_is_bid",
      fields: ["user_id", "is_active", "is_bid"],
    },
    {
      name: "idx_items_active_id",
      fields: ["is_active", "id"]
    },
    {
      name: "idx_items_isbids",
      fields: ["is_bid"],
    },
    {
      name: "idx_items_category",
      fields: ["category"],
    },
    {
      name: "idx_items_condition",
      fields: ["condition"],
    },
    {
      name: "idx_items_price",
      fields: ["starting_price"],
    },
    {
      name: "idx_items_createdat",
      fields: [{ attribute: "createdAt", order: "DESC" }],
    },
    {
      name: "idx_items_active_condition",
      fields: ["is_active", "condition"]
    },
    {
      name: "idx_items_active_category",
      fields: ["is_active", "category"]
    }
  ],
});

module.exports = Item;

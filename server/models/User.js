// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        len: [1, 50], 
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
        isEmail: true
      }
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reputation: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("USER", "ADMIN"),
    allowNull: false,
    defaultValue: "USER"
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [9, 30]  
    }
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_deleted: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
}

}, {
  tableName: "users",
  timestamps: false,
  indexes: [
    {
      name: "users_email_key",
      unique: true,
      fields: ["email"],
    },
     {
        name: "idx_users_role_deleted_id",
        fields: ["role", "is_deleted", "id"],
      },
  ]
});

module.exports = User;

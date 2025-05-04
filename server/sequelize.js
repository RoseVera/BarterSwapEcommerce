// sequelize.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("E_commerce_webapp", "postgres", "Tulin8228", {
  host: "localhost",
  dialect: "postgres",
}); 

module.exports = sequelize;

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const sequelize = require("./sequelize");

require("./models/Associations");

//middelware
app.use(cors());
app.use(express.json());


sequelize.sync({ alter: true })  // veya { force: true }
  .then(() => {
    console.log("Tüm tablolar senkronize edildi");
  })
  .catch((err) => {
    console.error("Sync hatası:", err);
  });

app.listen(5000,() =>{
    console.log("Server has started on port 5000 :)");
});
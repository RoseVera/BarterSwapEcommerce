const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const sequelize = require("./sequelize");

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/item");
const bidRoutes = require("./routes/bid");
const userRoutes = require("./routes/user");
const followerRoutes = require("./routes/follower");
const reviewRoutes = require("./routes/review");
const dmRoutes = require("./routes/dm");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

//Middelware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/user", userRoutes);
app.use("/api/followers", followerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dms", dmRoutes);

require("./models/Associations");
require("dotenv").config();



sequelize.sync()  // veya { force: true }
  .then(() => {
    console.log("Tüm tablolar senkronize edildi");
  }) 
  .catch((err) => {
    console.error("Sync hatası:", err);
  });

app.listen(5000,() =>{
    console.log("Server has started on port 5000 :)");
});
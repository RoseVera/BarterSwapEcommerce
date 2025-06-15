const express = require("express");
const app = express();
const cors = require("cors");
const sequelize = require("./sequelize");

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/item");
const bidRoutes = require("./routes/bid");
const userRoutes = require("./routes/user");
const followerRoutes = require("./routes/follower");
const reviewRoutes = require("./routes/review");
const dmRoutes = require("./routes/dm");
const statsRoutes = require("./routes/stats");
const adminRoutes = require("./routes/admin");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const seed = require("./scripts/seed"); 

//Middelware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
})); 
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`🕒 QUERY DURATION: ${req.method} ${req.originalUrl} took ${duration}ms`);
  });
  next();
});
//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/user", userRoutes);
app.use("/api/followers", followerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dms", dmRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

require("./models/Associations");
require("dotenv").config();

 

/*seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });*/

sequelize.sync()  // veya { force: true }
  .then(() => {
    console.log("Tüm tablolar senkronize edildi");
  })
  .catch((err) => {
    console.error("Sync hatası:", err);
  });

app.listen(5000, () => {
  console.log("Server has started on port 5000 :)");
});
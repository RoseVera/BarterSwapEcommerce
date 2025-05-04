const User = require("./User");
const Category = require("./Category");
const Item = require("./Item");
const Bid = require("./Bid");
const Transaction = require("./Transaction");
const Review = require("./Review");
const Bonus = require("./Bonus");
const DirectMessage = require("./DirectMessage");

// USER - ITEM (1:N)
User.hasMany(Item, { foreignKey: "user_id" });
Item.belongsTo(User, { foreignKey: "user_id" });

// CATEGORY - ITEM (1:N)
Category.hasMany(Item, { foreignKey: "category" });
Item.belongsTo(Category, { foreignKey: "category" });

// USER - BID (1:N)
User.hasMany(Bid, { foreignKey: "user_id" });
Bid.belongsTo(User, { foreignKey: "user_id" });

// ITEM - BID (1:N)
Item.hasMany(Bid, { foreignKey: "item_id" });
Bid.belongsTo(Item, { foreignKey: "item_id" });

// USER (buyer) - TRANSACTION (1:N)
User.hasMany(Transaction, { foreignKey: "buyer_id", as: "Purchases" });
Transaction.belongsTo(User, { foreignKey: "buyer_id", as: "Buyer" });

// USER (seller) - TRANSACTION (1:N)
User.hasMany(Transaction, { foreignKey: "seller_id", as: "Sales" });
Transaction.belongsTo(User, { foreignKey: "seller_id", as: "Seller" });

// ITEM - TRANSACTION (1:1)
Item.hasOne(Transaction, { foreignKey: "item_id" });
Transaction.belongsTo(Item, { foreignKey: "item_id" });

// TRANSACTION - REVIEW (1:1)
Transaction.hasMany(Review, { foreignKey: "transaction_id" });
Review.belongsTo(Transaction, { foreignKey: "transaction_id" });

// USER - BONUS (1:N)
User.hasMany(Bonus, { foreignKey: "user_id" });
Bonus.belongsTo(User, { foreignKey: "user_id" });

// USER - DIRECTMESSAGE (1:N) as Sender
User.hasMany(DirectMessage, { foreignKey: "sender_id", as: "SentMessages" });
DirectMessage.belongsTo(User, { foreignKey: "sender_id", as: "Sender" });

// USER - DIRECTMESSAGE (1:N) as Receiver
User.hasMany(DirectMessage, { foreignKey: "receiver_id", as: "ReceivedMessages" });
DirectMessage.belongsTo(User, { foreignKey: "receiver_id", as: "Receiver" });

module.exports = {
  User,
  Category,
  Item,
  Bid,
  Transaction,
  Review,
  Bonus,
  DirectMessage
};

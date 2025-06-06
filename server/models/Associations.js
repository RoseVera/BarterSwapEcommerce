const User = require("./User");
const Item = require("./Item");
const Bid = require("./Bid");
const Transaction = require("./Transaction");
const Review = require("./Review");
const Bonus = require("./Bonus");
const DirectMessage = require("./DirectMessage");
const Follower = require("./Follower");
const Conversation = require("./Conversation");

// USER - ITEM (1:N)
User.hasMany(Item, { foreignKey: "user_id" });
Item.belongsTo(User, { foreignKey: "user_id" });

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
Transaction.hasOne(Review, { foreignKey: "transaction_id" });
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

// DIRECT MESSAGE - CONVERSATION
Conversation.hasMany(DirectMessage, { foreignKey: "conversation_id" });
DirectMessage.belongsTo(Conversation, { foreignKey: "conversation_id" });

// USER - CONVERSATION Associations
User.hasMany(Conversation, { foreignKey: "participant_one_id", as: "ConversationsAsOne" });
User.hasMany(Conversation, { foreignKey: "participant_two_id", as: "ConversationsAsTwo" });

Conversation.belongsTo(User, { foreignKey: "participant_one_id", as: "ParticipantOne" });
Conversation.belongsTo(User, { foreignKey: "participant_two_id", as: "ParticipantTwo" });

// USER - FOLLOWERS (M:N with self-reference)
User.belongsToMany(User, {
  through: Follower,
  as: "Followers",           
  foreignKey: "followed_id",
  otherKey: "follower_id"
});

User.belongsToMany(User, {
  through: Follower,
  as: "Following",           
  foreignKey: "follower_id",
  otherKey: "followed_id"
});

// FOLLOWER -> FOLLOWED USER (N:1)
Follower.belongsTo(User, { foreignKey: 'followed_id', as: 'followed' });

// USER - REVIEW (1:N)
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

Bonus.belongsTo(User, { foreignKey: "user_id"});

module.exports = {
  User,
  Item,
  Bid,
  Transaction,
  Review,
  Bonus,
  DirectMessage,
  Follower,
  Conversation
};

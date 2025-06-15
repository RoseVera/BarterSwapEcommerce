const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const sequelize = require("../sequelize");

const User = require("../models/User");
const Item = require("../models/Item");
const Bid = require("../models/Bid");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Bonus = require("../models/Bonus");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const Follower = require("../models/Follower");

async function seed() {
  const passwordPlain = "12345";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  //await sequelize.query('DROP TYPE IF EXISTS "public"."enum_bonuses_type" CASCADE;');
  await sequelize.sync();

  console.log("Seeding users...");
  const users = [];
  for (let i = 0; i < 20000; i++) {
    users.push({
      name: faker.person.fullName().slice(0, 50),
      password: hashedPassword,
      email: `user${Date.now()}_${i}@example.com`, // Benzersiz email
      student_id: faker.string.uuid().slice(0, 10),
      reputation: 0,
      role: "USER",
      phone: faker.phone.number("5#########"),
      birthday: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
      balance: faker.number.int({ min: 0, max: 1000 }),
      is_deleted: false,
    });
  }
  const createdUsers = await User.bulkCreate(users, { returning: true });

  console.log("Seeding items...");
  const items = [];
  for (let i = 0; i < 200000; i++) {
    const isActive = i < 100000;
    const isBid = faker.datatype.boolean();
    const user = faker.helpers.arrayElement(createdUsers);
    items.push({
      user_id: user.id,
      title: faker.commerce.productName().slice(0, 255),
      description: faker.commerce.productDescription().slice(0, 500),
      category: faker.helpers.arrayElement([
        "BOOK", "CLOTHING", "SHOES", "TEXTILE", "STATIONERY",
        "ELECTRONICS", "TOYS", "SPORT", "BEAUTY", "ART",
        "MUSIC", "FURNITURE", "JEWELRY", "HEALTH", "OTHER"
      ]),
      starting_price: faker.number.int({ min: 10, max: 1000 }),
      current_price: null,
      image: faker.image.url(),
      condition: faker.helpers.arrayElement(["NEW", "LIKE NEW", "GOOD", "ACCEPTABLE", "BAD"]),
      is_active: isActive,
      is_bid: isBid,
    });
  }
  const createdItems = await Item.bulkCreate(items, { returning: true });

  console.log("Seeding bids...");
  const bidItems = createdItems.filter(i => i.is_bid);
  const bids = [];
  for (let i = 0; i < 60000; i++) {
    const item = faker.helpers.arrayElement(bidItems);
    const user = faker.helpers.arrayElement(createdUsers);
    const bidAmount = (item.current_price || item.starting_price) + faker.number.int({ min: 1, max: 100 });
    bids.push({
      user_id: user.id,
      item_id: item.id,
      bid_amount: bidAmount,
    });
    item.current_price = bidAmount;
  }
  await Bid.bulkCreate(bids);
  await Promise.all(bidItems.map(item => item.save()));

  console.log("Seeding transactions...");
  const inactiveItems = createdItems.filter(i => !i.is_active);
  const transactions = [];
  for (let i = 0; i < 100000; i++) {
    const item = faker.helpers.arrayElement(inactiveItems);
    const buyer = faker.helpers.arrayElement(createdUsers);
    const sellerId = item.user_id;

    if (buyer.id === sellerId) {
      i--;
      continue;
    }

    transactions.push({
      buyer_id: buyer.id,
      seller_id: sellerId,
      item_id: item.id,
      price: item.current_price || item.starting_price,
      createdAt: faker.date.past(1),
      updatedAt: new Date(),
    });
  }
  const createdTransactions = await Transaction.bulkCreate(transactions, { returning: true });

  console.log("Seeding reviews...");
  const reviews = [];
  for (let i = 0; i < 100000; i++) {
    const transaction = faker.helpers.arrayElement(createdTransactions);
    reviews.push({
      transaction_id: transaction.id,
      review: faker.lorem.sentences(2),
      rating: faker.number.int({ min: 1, max: 5 }),
    });
  }
  await Review.bulkCreate(reviews);

  console.log("Seeding bonuses...");
  const bonuses = [];
  for (let i = 0; i < 100000; i++) {
    const user = faker.helpers.arrayElement(createdUsers);
    bonuses.push({
      user_id: user.id,
      amount: faker.number.int({ min: 10, max: 500 }),
      type: faker.helpers.arrayElement(["BONUS", "REWARD"]),
    });
  }
  await Bonus.bulkCreate(bonuses);

  console.log("Seeding conversations...");
  const conversations = [];
  for (let i = 0; i < 20000; i++) {
    let u1 = faker.helpers.arrayElement(createdUsers);
    let u2;
    do {
      u2 = faker.helpers.arrayElement(createdUsers);
    } while (u1.id === u2.id);

    conversations.push({
      participant_one_id: u1.id,
      participant_two_id: u2.id,
    });
  }
  const createdConversations = await Conversation.bulkCreate(conversations, { returning: true });

  console.log("Seeding direct messages...");
  const messages = [];
  for (let i = 0; i < 100000; i++) {
    const c = faker.helpers.arrayElement(createdConversations);
    const senderId = faker.helpers.arrayElement([c.participant_one_id, c.participant_two_id]);
    const receiverId = senderId === c.participant_one_id ? c.participant_two_id : c.participant_one_id;

    messages.push({
      sender_id: senderId,
      receiver_id: receiverId,
      content: faker.lorem.sentence(),
      conversation_id: c.id,
      createdAt: faker.date.past(1),
      updatedAt: new Date(),
    }); 
  }  
  await DirectMessage.bulkCreate(messages);

  console.log("Seeding followers...");
  const followers = new Set();
  const followerPairs = [];
  while (followerPairs.length < 100000) {
    let follower = faker.helpers.arrayElement(createdUsers);
    let followed;
    do {
      followed = faker.helpers.arrayElement(createdUsers);
    } while (follower.id === followed.id);

    const key = `${follower.id}-${followed.id}`;
    if (!followers.has(key)) {
      followers.add(key);
      followerPairs.push({
        follower_id: follower.id,
        followed_id: followed.id,
      });
    }
  }
  await Follower.bulkCreate(followerPairs);

  console.log("🎉 Seed işlemi tamamlandı.");
}

module.exports = seed;



/*const { faker } = require("@faker-js/faker");

const bcrypt = require("bcrypt");
const sequelize = require("../sequelize");

const User = require("../models/User");
const Item = require("../models/Item");
const Bid = require("../models/Bid");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Bonus = require("../models/Bonus");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const Follower = require("../models/Follower");

function randomDateBetween(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function bulkInsertInBatches(model, data, batchSize = 10000, options = {}) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.bulkCreate(batch, options);
  }
}

async function seed() {
  const passwordPlain = "12345";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  await sequelize.query('DROP TYPE IF EXISTS "public"."enum_bonuses_type" CASCADE;');
  await sequelize.sync({ force: true });

  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-06-15");

  console.log("Seeding users...");
  const users = [];
  for (let i = 0; i < 50000; i++) {
    users.push({
      name: faker.person.fullName().slice(0, 50),
      password: hashedPassword,
      email: `user${i}@example.com`,
      student_id: faker.string.uuid().slice(0, 10),
      reputation: 0,
      role: "USER",
      phone: faker.phone.number("5#########"),
      birthday: faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
      balance: faker.number.int({ min: 0, max: 1000 }),
      is_deleted: false,
    });
  }
  const createdUsers = await User.bulkCreate(users, { returning: true });

  console.log("Seeding items...");
  const items = [];
  for (let i = 0; i < 1000000; i++) {
    const isActive = i < 500000;
    const isBid = faker.datatype.boolean();
    const user = faker.helpers.arrayElement(createdUsers);
    items.push({
      user_id: user.id,
      title: faker.commerce.productName().slice(0, 255),
      description: faker.commerce.productDescription().slice(0, 500),
      category: faker.helpers.arrayElement([
        "BOOK", "CLOTHING", "SHOES", "TEXTILE", "STATIONERY",
        "ELECTRONICS", "TOYS", "SPORT", "BEAUTY", "ART",
        "MUSIC", "FURNITURE", "JEWELRY", "HEALTH", "OTHER"
      ]),
      starting_price: faker.number.int({ min: 10, max: 1000 }),
      current_price: null,
      image: faker.image.url(),
      condition: faker.helpers.arrayElement(["NEW", "LIKE NEW", "GOOD", "ACCEPTABLE", "BAD"]),
      is_active: isActive,
      is_bid: isBid,
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(Item, items, 10000);
  const createdItems = await Item.findAll({ attributes: ["id", "user_id", "starting_price", "current_price", "is_bid", "is_active"] });

  console.log("Seeding bids...");
  const bidItems = createdItems.filter(i => i.is_bid);
  const bids = [];
  for (let i = 0; i < 100000; i++) {
    const item = faker.helpers.arrayElement(bidItems);
    const user = faker.helpers.arrayElement(createdUsers);
    const bidAmount = (item.current_price || item.starting_price) + faker.number.int({ min: 1, max: 100 });
    bids.push({
      user_id: user.id,
      item_id: item.id,
      bid_amount: bidAmount,
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
    item.current_price = bidAmount;
  }
  await bulkInsertInBatches(Bid, bids, 10000);
  await Promise.all(bidItems.map(item => item.save()));

  console.log("Seeding transactions...");
  const inactiveItems = createdItems.filter(i => !i.is_active);
  const transactions = [];
  for (let i = 0; i < 500000; i++) {
    const item = faker.helpers.arrayElement(inactiveItems);
    const buyer = faker.helpers.arrayElement(createdUsers);
    const sellerId = item.user_id;
    if (buyer.id === sellerId) {
      i--;
      continue;
    }
    transactions.push({
      buyer_id: buyer.id,
      seller_id: sellerId,
      item_id: item.id,
      price: item.current_price || item.starting_price,
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(Transaction, transactions, 10000);
  const createdTransactions = await Transaction.findAll();

  console.log("Seeding reviews...");
  const reviews = [];
  for (let i = 0; i < 500000; i++) {
    const transaction = faker.helpers.arrayElement(createdTransactions);
    reviews.push({
      transaction_id: transaction.id,
      review: faker.lorem.sentences(2),
      rating: faker.number.int({ min: 1, max: 5 }),
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(Review, reviews, 10000);

  console.log("Seeding bonuses...");
  const bonuses = [];
  for (let i = 0; i < 500000; i++) {
    const user = faker.helpers.arrayElement(createdUsers);
    bonuses.push({
      user_id: user.id,
      amount: faker.number.int({ min: 10, max: 500 }),
      type: faker.helpers.arrayElement(["BONUS", "REWARD"]),
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(Bonus, bonuses, 10000);

  console.log("Seeding conversations...");
  const conversations = [];
  for (let i = 0; i < 100000; i++) {
    let u1 = faker.helpers.arrayElement(createdUsers);
    let u2;
    do {
      u2 = faker.helpers.arrayElement(createdUsers);
    } while (u1.id === u2.id);
    conversations.push({
      participant_one_id: u1.id,
      participant_two_id: u2.id,
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(Conversation, conversations, 10000);
  const createdConversations = await Conversation.findAll();

  console.log("Seeding direct messages...");
  const messages = [];
  for (let i = 0; i < 500000; i++) {
    const c = faker.helpers.arrayElement(createdConversations);
    const senderId = faker.helpers.arrayElement([c.participant_one_id, c.participant_two_id]);
    const receiverId = senderId === c.participant_one_id ? c.participant_two_id : c.participant_one_id;
    messages.push({
      sender_id: senderId,
      receiver_id: receiverId,
      content: faker.lorem.sentence(),
      conversation_id: c.id,
      createdAt: randomDateBetween(startDate, endDate),
      updatedAt: new Date(),
    });
  }
  await bulkInsertInBatches(DirectMessage, messages, 10000);

  console.log("Seeding followers...");
  const followers = new Set();
  const followerPairs = [];
  while (followerPairs.length < 500000) {
    let follower = faker.helpers.arrayElement(createdUsers);
    let followed;
    do {
      followed = faker.helpers.arrayElement(createdUsers);
    } while (follower.id === followed.id);
    const key = `${follower.id}-${followed.id}`;
    if (!followers.has(key)) {
      followers.add(key);
      followerPairs.push({
        follower_id: follower.id,
        followed_id: followed.id,
        createdAt: randomDateBetween(startDate, endDate),
        updatedAt: new Date(),
      });
    }
  }
  await bulkInsertInBatches(Follower, followerPairs, 10000);

  console.log("🎉 Seed işlemi tamamlandı.");
}

module.exports = seed;


*/


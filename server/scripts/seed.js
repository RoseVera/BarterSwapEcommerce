const { faker } = require("@faker-js/faker");
const Item = require("./models/Item");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const Bid = require("./models/Bid");
const Bonus = require("./models/Bonus");
const Conversation = require("./models/Conversation");
const DirectMessage = require("./models/DirectMessage");
const Follower = require("./models/Follower");
const Review = require("./models/Review");


const bcrypt = require('bcrypt');
async function seed() {
  // Önce enum tipini ve ona bağlı nesneleri zorla sil
  const passwordPlain = "12345";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);
  await sequelize.query('DROP TYPE IF EXISTS "public"."enum_bonuses_type" CASCADE;');

  await User.sync({ force: true });
  await Item.sync({ force: true });
  await Bid.sync({ force: true });

  await Bonus.sync({ force: true });
  await Conversation.sync({ force: true });
  await DirectMessage.sync({ force: true });
  await Follower.sync({ force: true });
  await Transaction.sync({ force: true }); // Transaction son oluşturulmalı
  await Review.sync({ force: true });


 
  // USER: 20 adet
  const users = [];
  for (let i = 0; i < 2000; i++) {
    users.push(await User.create({
      name: faker.person.fullName().slice(0, 50),
      password: hashedPassword,
      email: faker.internet.email(),
      student_id: faker.string.uuid().slice(0, 10),
      reputation: 0,
      role: "USER",
      phone: faker.phone.number('5#########'),
      birthday: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
      balance: faker.number.int({ min: 0, max: 1000 }),
      is_deleted: false,
    }));
  }

  // ITEM: 30 adet (15 aktif, 15 satılmış)
  const categories = [
    'BOOK', 'CLOTHING', 'SHOES', 'TEXTILE', 'STATIONERY',
    'ELECTRONICS', 'TOYS', 'SPORT', 'BEAUTY', 'ART', 'MUSIC',
    'FURNITURE', 'JEWELRY', 'HEALTH', 'OTHER'
  ];
  const conditions = ["NEW", "LIKE NEW", "GOOD", "ACCEPTABLE", "BAD"];

  const items = [];
  for (let i = 0; i < 3000; i++) {
    const user = faker.helpers.arrayElement(users);
    items.push(await Item.create({
      user_id: user.id,
      title: faker.commerce.productName().slice(0, 255),
      description: faker.commerce.productDescription().slice(0, 500),
      category: faker.helpers.arrayElement(categories),
      starting_price: faker.number.int({ min: 10, max: 1000 }),
      current_price: null,
      image: faker.image.url(),
      condition: faker.helpers.arrayElement(conditions),
      is_active: i < 1500 ? true : false, // İlk 15 aktif, sonrası satılmış
      is_bid: faker.datatype.boolean(),
    }));
  }

  // BID: sadece is_bid=true olan itemlara (20 adet kadar)
  for (let i = 0; i < 2000; i++) {
    const user = faker.helpers.arrayElement(users);

    let item;
    do {
      item = faker.helpers.arrayElement(items);
    } while (!item.is_bid);

    const basePrice = item.current_price || item.starting_price;
    const bidAmount = faker.number.int({ min: basePrice + 1, max: basePrice + 500 });

    await Bid.create({
      user_id: user.id,
      item_id: item.id,
      bid_amount: bidAmount,
    });

    // Bid sonrası current_price güncelle
    item.current_price = bidAmount;
    await item.save();
  }

  // TRANSACTION: sadece is_active = false olan itemlara (satılmış olanlara)
  for (let i = 1500; i < 3000; i++) {
    const buyer = faker.helpers.arrayElement(users);
    const seller = users.find(u => u.id === items[i].user_id); // item sahibi satıcı

    if (buyer.id === seller.id) {
      // Aynı kişi alıcı ve satıcı olamaz, farklı bir buyer seçelim
      i--;
      continue;
    }

    const price = items[i].current_price || items[i].starting_price;

    await Transaction.create({
      buyer_id: buyer.id,
      seller_id: seller.id,
      item_id: items[i].id,
      price,
      createdAt: faker.date.past(1),
      updatedAt: new Date(),
    });
  }

  // REVIEW: sadece satılmış itemların transactionlarına (20 adet)
  const soldTransactions = await Transaction.findAll({
    include: [{ model: Item, where: { is_active: false } }]
  });

  for (let i = 0; i < 2000; i++) {
    const transaction = faker.helpers.arrayElement(soldTransactions);
    await Review.create({
      transaction_id: transaction.id,
      review: faker.lorem.sentences(2),
      rating: faker.number.int({ min: 1, max: 5 }),
    });
  }

  // BONUS
  for (let i = 0; i < 2000; i++) {
    const user = faker.helpers.arrayElement(users);
    await Bonus.create({
      user_id: user.id,
      amount: faker.number.int({ min: 10, max: 500 }),
      type: faker.helpers.arrayElement(["BONUS", "REWARD"]),
    });
  }

  // CONVERSATION: farklı kullanıcılar arasında
  for (let i = 0; i < 2000; i++) {
    let participant_one = faker.helpers.arrayElement(users);
    let participant_two;
    do {
      participant_two = faker.helpers.arrayElement(users);
    } while (participant_two.id === participant_one.id);

    await Conversation.create({
      participant_one_id: participant_one.id,
      participant_two_id: participant_two.id,
    });
  }

  // DIRECT MESSAGE: conversation içindeki kullanıcılar arasında
  const conversations = await Conversation.findAll();
  for (let i = 0; i < 2000; i++) {
    const conversation = faker.helpers.arrayElement(conversations);
    const sender_id = faker.helpers.arrayElement([conversation.participant_one_id, conversation.participant_two_id]);
    const receiver_id = sender_id === conversation.participant_one_id ? conversation.participant_two_id : conversation.participant_one_id;

    await DirectMessage.create({
      sender_id,
      receiver_id,
      content: faker.lorem.sentence(),
      conversation_id: conversation.id,
      createdAt: faker.date.past(1),
      updatedAt: new Date(),
    });
  }

  // FOLLOWER: farklı kullanıcılar arasında
  for (let i = 0; i < 2000; i++) {
    let follower, followed;
    do {
      follower = faker.helpers.arrayElement(users);
      followed = faker.helpers.arrayElement(users);
    } while (follower.id === followed.id);

    try {
      await Follower.create({
        follower_id: follower.id,
        followed_id: followed.id,
      });
    } catch (e) {
      i--;
    }
  }

  console.log("Seed işlemi tamamlandı.");
}
module.exports = seed;

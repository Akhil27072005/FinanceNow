/**
 * Screenshot / demo seed for test@example.com
 *
 * Seeds two months of representative data (previous + current calendar month):
 * categories, transactions, budgets, subscriptions, payment methods, portfolio.
 *
 * Usage (from backend/): npm run seed
 * Requires: MONGODB_URI in .env (server does not need to be running)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const User = require('../models/User');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Tag = require('../src/models/Tag');
const PaymentMethod = require('../src/models/PaymentMethod');
const Transaction = require('../src/models/Transaction');
const Budget = require('../src/models/Budget');
const Subscription = require('../src/models/Subscription');
const SubscriptionPayment = require('../src/models/SubscriptionPayment');
const PortfolioHolding = require('../src/models/PortfolioHolding');
const PortfolioActivity = require('../src/models/PortfolioActivity');

const cache = require('../utils/cache');

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test1234';
const TEST_NAME = 'Alex Demo';

const atNoon = (year, monthIndex, day) => new Date(year, monthIndex, day, 12, 0, 0, 0);

const monthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(12, 0, 0, 0);
  return next;
};

async function ensureUser() {
  let user = await User.findOne({ email: TEST_EMAIL });
  if (!user) {
    user = new User({
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      authProvider: 'local',
      preferences: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
        themePresetId: 'slateProfessional'
      }
    });
    await user.save();
    console.log(`✔ Created user ${TEST_EMAIL}`);
  } else {
    user.name = TEST_NAME;
    user.password = TEST_PASSWORD;
    user.authProvider = 'local';
    if (!user.preferences?.currency) {
      user.preferences = { ...user.preferences, currency: 'INR' };
    }
    await user.save();
    console.log(`✔ Reset credentials for ${TEST_EMAIL}`);
  }
  return user;
}

async function clearUserData(userId) {
  const id = userId;
  await PortfolioActivity.deleteMany({ userId: id });
  await PortfolioHolding.deleteMany({ userId: id });
  await SubscriptionPayment.deleteMany({ userId: id });
  await Subscription.deleteMany({ userId: id });
  await Budget.deleteMany({ userId: id });
  await Transaction.deleteMany({ userId: id });
  await Tag.deleteMany({ userId: id });
  await SubCategory.deleteMany({ userId: id });
  await Category.deleteMany({ userId: id });
  await PaymentMethod.deleteMany({ userId: id });
  console.log('✔ Cleared existing demo data');
}

async function seedCatalog(userId) {
  const categories = await Category.insertMany([
    { userId, name: 'Salary', type: 'income', icon: 'lucide:wallet' },
    { userId, name: 'Freelance', type: 'income', icon: 'lucide:laptop' },
    { userId, name: 'Food', type: 'expense', icon: 'lucide:utensils' },
    { userId, name: 'Transport', type: 'expense', icon: 'lucide:car' },
    { userId, name: 'Housing', type: 'expense', icon: 'lucide:home' },
    { userId, name: 'Shopping', type: 'expense', icon: 'lucide:shopping-bag' },
    { userId, name: 'Entertainment', type: 'expense', icon: 'lucide:tv' },
    { userId, name: 'Health', type: 'expense', icon: 'lucide:heart-pulse' },
    { userId, name: 'Emergency Fund', type: 'savings', icon: 'lucide:piggy-bank' },
    { userId, name: 'Investments', type: 'investment', icon: 'lucide:trending-up' }
  ]);

  const byName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const subCategories = await SubCategory.insertMany([
    { userId, categoryId: byName.Food._id, name: 'Groceries', icon: 'lucide:shopping-cart' },
    { userId, categoryId: byName.Food._id, name: 'Restaurants', icon: 'lucide:utensils-crossed' },
    { userId, categoryId: byName.Food._id, name: 'Coffee', icon: 'lucide:coffee' },
    { userId, categoryId: byName.Transport._id, name: 'Fuel', icon: 'lucide:fuel' },
    { userId, categoryId: byName.Transport._id, name: 'Ride Share', icon: 'lucide:car-taxi-front' },
    { userId, categoryId: byName.Transport._id, name: 'Public Transit', icon: 'lucide:train-front' },
    { userId, categoryId: byName.Housing._id, name: 'Rent', icon: 'lucide:building-2' },
    { userId, categoryId: byName.Housing._id, name: 'Utilities', icon: 'lucide:lightbulb' },
    { userId, categoryId: byName.Shopping._id, name: 'Clothing', icon: 'lucide:shirt' },
    { userId, categoryId: byName.Shopping._id, name: 'Electronics', icon: 'lucide:smartphone' },
    { userId, categoryId: byName.Entertainment._id, name: 'Streaming', icon: 'lucide:play-circle' },
    { userId, categoryId: byName.Health._id, name: 'Pharmacy', icon: 'lucide:pill' }
  ]);

  const subByName = Object.fromEntries(subCategories.map((s) => [s.name, s]));

  const tags = await Tag.insertMany([
    { userId, name: 'Essential', color: '#3b82f6' },
    { userId, name: 'Work', color: '#8b5cf6' },
    { userId, name: 'Personal', color: '#ec4899' },
    { userId, name: 'Discretionary', color: '#f59e0b' }
  ]);

  const tagByName = Object.fromEntries(tags.map((t) => [t.name, t]));

  const paymentMethods = await PaymentMethod.insertMany([
    {
      userId,
      name: 'HDFC Credit Card',
      icon: 'logos:mastercard',
      type: 'card',
      detailLabel: 'Last 4 digits'
    },
    {
      userId,
      name: 'PhonePe UPI',
      icon: 'simple-icons:phonepe',
      type: 'digital_wallet',
      detailLabel: 'UPI ID'
    },
    {
      userId,
      name: 'HDFC Savings',
      icon: 'lucide:landmark',
      type: 'bank',
      detailLabel: 'Account number'
    }
  ]);

  const pmByName = Object.fromEntries(paymentMethods.map((p) => [p.name, p]));

  console.log('✔ Seeded catalog (categories, tags, payment methods)');

  return { byName, subByName, tagByName, pmByName };
}

function buildTransactions(userId, catalog, prevMonthStart, currMonthStart, today) {
  const { byName, subByName, tagByName, pmByName } = catalog;
  const essential = tagByName.Essential._id;
  const work = tagByName.Work._id;
  const personal = tagByName.Personal._id;
  const discretionary = tagByName.Discretionary._id;

  const py = prevMonthStart.getFullYear();
  const pm = prevMonthStart.getMonth();
  const cy = currMonthStart.getFullYear();
  const cm = currMonthStart.getMonth();
  const todayDay = today.getDate();

  const tx = (fields) => ({ userId, account: 'self', ...fields });

  const prevMonthTx = [
    tx({
      type: 'income',
      amount: 85000,
      date: atNoon(py, pm, 1),
      categoryId: byName.Salary._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      paymentMethodDetail: '****4821',
      tags: [essential],
      notes: 'Monthly salary'
    }),
    tx({
      type: 'income',
      amount: 15000,
      date: atNoon(py, pm, 15),
      categoryId: byName.Freelance._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      tags: [work],
      notes: 'Client invoice — design project'
    }),
    tx({
      type: 'expense',
      amount: 22000,
      date: atNoon(py, pm, 1),
      categoryId: byName.Housing._id,
      subCategoryId: subByName.Rent._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      tags: [essential],
      notes: 'Apartment rent'
    }),
    tx({
      type: 'expense',
      amount: 4500,
      date: atNoon(py, pm, 3),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 3800,
      date: atNoon(py, pm, 10),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 4200,
      date: atNoon(py, pm, 17),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 3600,
      date: atNoon(py, pm, 24),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 1800,
      date: atNoon(py, pm, 6),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Restaurants._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [personal, discretionary]
    }),
    tx({
      type: 'expense',
      amount: 2400,
      date: atNoon(py, pm, 14),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Restaurants._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [personal, discretionary]
    }),
    tx({
      type: 'expense',
      amount: 3200,
      date: atNoon(py, pm, 22),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Restaurants._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [personal, discretionary]
    }),
    tx({
      type: 'expense',
      amount: 2500,
      date: atNoon(py, pm, 5),
      categoryId: byName.Transport._id,
      subCategoryId: subByName.Fuel._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 2200,
      date: atNoon(py, pm, 19),
      categoryId: byName.Transport._id,
      subCategoryId: subByName.Fuel._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 800,
      date: atNoon(py, pm, 8),
      categoryId: byName.Transport._id,
      subCategoryId: subByName['Public Transit']._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [work]
    }),
    tx({
      type: 'expense',
      amount: 4500,
      date: atNoon(py, pm, 12),
      categoryId: byName.Shopping._id,
      subCategoryId: subByName.Clothing._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [discretionary]
    }),
    tx({
      type: 'expense',
      amount: 2800,
      date: atNoon(py, pm, 28),
      categoryId: byName.Shopping._id,
      subCategoryId: subByName.Electronics._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [discretionary]
    }),
    tx({
      type: 'expense',
      amount: 599,
      date: atNoon(py, pm, 7),
      categoryId: byName.Housing._id,
      subCategoryId: subByName.Utilities._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential],
      notes: 'Mobile recharge'
    }),
    tx({
      type: 'expense',
      amount: 1200,
      date: atNoon(py, pm, 20),
      categoryId: byName.Health._id,
      subCategoryId: subByName.Pharmacy._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'savings',
      amount: 10000,
      date: atNoon(py, pm, 5),
      categoryId: byName['Emergency Fund']._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      tags: [essential],
      notes: 'Monthly transfer to emergency fund'
    })
  ];

  const currentMonthTx = [
    tx({
      type: 'income',
      amount: 85000,
      date: atNoon(cy, cm, 1),
      categoryId: byName.Salary._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      paymentMethodDetail: '****4821',
      tags: [essential],
      notes: 'Monthly salary'
    }),
    tx({
      type: 'expense',
      amount: 22000,
      date: atNoon(cy, cm, 1),
      categoryId: byName.Housing._id,
      subCategoryId: subByName.Rent._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      tags: [essential],
      notes: 'Apartment rent'
    }),
    tx({
      type: 'expense',
      amount: 4800,
      date: atNoon(cy, cm, 4),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 3900,
      date: atNoon(cy, cm, 11),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Groceries._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 2100,
      date: atNoon(cy, cm, 7),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Restaurants._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [personal, discretionary]
    }),
    tx({
      type: 'expense',
      amount: 2850,
      date: atNoon(cy, cm, 15),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Restaurants._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [personal, discretionary]
    }),
    tx({
      type: 'expense',
      amount: 350,
      date: atNoon(cy, cm, 12),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Coffee._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [work]
    }),
    tx({
      type: 'expense',
      amount: 280,
      date: atNoon(cy, cm, 16),
      categoryId: byName.Food._id,
      subCategoryId: subByName.Coffee._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [work]
    }),
    tx({
      type: 'expense',
      amount: 2600,
      date: atNoon(cy, cm, 6),
      categoryId: byName.Transport._id,
      subCategoryId: subByName.Fuel._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [essential]
    }),
    tx({
      type: 'expense',
      amount: 450,
      date: atNoon(cy, cm, 9),
      categoryId: byName.Transport._id,
      subCategoryId: subByName['Ride Share']._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [work]
    }),
    tx({
      type: 'expense',
      amount: 380,
      date: atNoon(cy, cm, 14),
      categoryId: byName.Transport._id,
      subCategoryId: subByName['Ride Share']._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [work]
    }),
    tx({
      type: 'expense',
      amount: 5200,
      date: atNoon(cy, cm, 10),
      categoryId: byName.Shopping._id,
      subCategoryId: subByName.Electronics._id,
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      tags: [discretionary],
      notes: 'Wireless earbuds'
    }),
    tx({
      type: 'expense',
      amount: 599,
      date: atNoon(cy, cm, 5),
      categoryId: byName.Housing._id,
      subCategoryId: subByName.Utilities._id,
      paymentMethodId: pmByName['PhonePe UPI']._id,
      tags: [essential],
      notes: 'Mobile recharge'
    }),
    tx({
      type: 'savings',
      amount: 12000,
      date: atNoon(cy, cm, 8),
      categoryId: byName['Emergency Fund']._id,
      paymentMethodId: pmByName['HDFC Savings']._id,
      tags: [essential],
      notes: 'Monthly transfer to emergency fund'
    })
  ];

  // Only include current-month rows up to today (keeps dashboard realistic mid-month)
  const filteredCurrent = currentMonthTx.filter((row) => row.date.getDate() <= todayDay);

  return [...prevMonthTx, ...filteredCurrent];
}

async function seedTransactions(userId, catalog, prevMonthStart, currMonthStart, today) {
  const rows = buildTransactions(userId, catalog, prevMonthStart, currMonthStart, today);
  const created = await Transaction.insertMany(rows);
  console.log(`✔ Seeded ${created.length} transactions (${monthKey(prevMonthStart)} + ${monthKey(currMonthStart)})`);
  return created;
}

async function seedBudgets(userId, catalog, prevKey, currKey) {
  const { byName, subByName } = catalog;
  await Budget.insertMany([
    { userId, categoryId: byName.Food._id, amount: 20000, month: prevKey },
    { userId, categoryId: byName.Transport._id, amount: 6000, month: prevKey },
    { userId, categoryId: byName.Shopping._id, amount: 8000, month: prevKey },
    { userId, categoryId: byName.Food._id, amount: 18000, month: currKey },
    { userId, categoryId: byName.Transport._id, amount: 5000, month: currKey },
    { userId, categoryId: byName.Shopping._id, amount: 4000, month: currKey },
    { userId, subCategoryId: subByName.Restaurants._id, amount: 6000, month: currKey }
  ]);
  console.log('✔ Seeded budgets for both months');
}

async function seedSubscriptions(userId, catalog, today, pmByName) {
  const { byName, subByName } = catalog;

  const subs = await Subscription.insertMany([
    {
      userId,
      name: 'Netflix',
      amount: 649,
      categoryId: byName.Entertainment._id,
      billingCycle: 'monthly',
      nextPaymentDate: addDays(today, 3),
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      isActive: true,
      autoRenew: true
    },
    {
      userId,
      name: 'Spotify',
      amount: 119,
      categoryId: byName.Entertainment._id,
      billingCycle: 'monthly',
      nextPaymentDate: addDays(today, 12),
      paymentMethodId: pmByName['PhonePe UPI']._id,
      isActive: true,
      autoRenew: true
    },
    {
      userId,
      name: 'Google One',
      amount: 130,
      categoryId: byName.Entertainment._id,
      billingCycle: 'monthly',
      nextPaymentDate: addDays(today, -2),
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      isActive: true,
      autoRenew: true
    },
    {
      userId,
      name: 'Cult.fit Gym',
      amount: 2500,
      categoryId: byName.Health._id,
      billingCycle: 'monthly',
      nextPaymentDate: addDays(today, 8),
      paymentMethodId: pmByName['HDFC Savings']._id,
      isActive: true,
      autoRenew: true
    },
    {
      userId,
      name: 'Adobe Creative Cloud',
      amount: 1675,
      categoryId: byName.Entertainment._id,
      billingCycle: 'yearly',
      nextPaymentDate: addDays(today, 45),
      paymentMethodId: pmByName['HDFC Credit Card']._id,
      paymentMethodDetail: '4532',
      isActive: true,
      autoRenew: true
    }
  ]);

  const netflix = subs.find((s) => s.name === 'Netflix');
  const spotify = subs.find((s) => s.name === 'Spotify');

  await SubscriptionPayment.insertMany([
    {
      userId,
      subscriptionId: netflix._id,
      amount: 649,
      billingDueDate: addDays(today, -27),
      source: 'auto-renew'
    },
    {
      userId,
      subscriptionId: spotify._id,
      amount: 119,
      billingDueDate: addDays(today, -18),
      source: 'auto-renew'
    }
  ]);

  console.log(`✔ Seeded ${subs.length} subscriptions (1 overdue, mix of upcoming)`);
  return subs;
}

async function seedPortfolio(userId, catalog, prevMonthStart, currMonthStart) {
  const { byName } = catalog;
  const investmentCategory = byName.Investments;

  const nifty = await PortfolioHolding.create({
    userId,
    assetKey: 'NIFTY50-INDEX',
    finnhubSymbol: 'NIFTY50-INDEX',
    assetType: 'mutual_fund',
    dataProvider: 'manual',
    displayName: 'Nifty 50 Index Fund',
    categoryId: investmentCategory._id,
    quoteCurrency: 'INR',
    totalQuantity: 0,
    totalCostBasis: 125000
  });

  const largeCap = await PortfolioHolding.create({
    userId,
    assetKey: 'LARGE-CAP-MF',
    finnhubSymbol: 'LARGE-CAP-MF',
    assetType: 'mutual_fund',
    dataProvider: 'manual',
    displayName: 'Large Cap Equity Fund',
    categoryId: investmentCategory._id,
    quoteCurrency: 'INR',
    totalQuantity: 0,
    totalCostBasis: 80000
  });

  await PortfolioActivity.insertMany([
    {
      userId,
      holdingId: nifty._id,
      type: 'set_position',
      date: atNoon(prevMonthStart.getFullYear(), prevMonthStart.getMonth(), 10),
      amount: 125000
    },
    {
      userId,
      holdingId: largeCap._id,
      type: 'set_position',
      date: atNoon(prevMonthStart.getFullYear(), prevMonthStart.getMonth(), 20),
      amount: 80000
    }
  ]);

  const contribDate = atNoon(currMonthStart.getFullYear(), currMonthStart.getMonth(), 3);
  const contribAmount = 10000;

  nifty.totalCostBasis += contribAmount;
  await nifty.save();

  const investmentTx = await Transaction.create({
    userId,
    type: 'investment',
    amount: contribAmount,
    date: contribDate,
    categoryId: investmentCategory._id,
    paymentMethodId: null,
    account: 'self',
    notes: `Portfolio: ${nifty.displayName}`
  });

  await PortfolioActivity.create({
    userId,
    holdingId: nifty._id,
    type: 'add_contribution',
    date: contribDate,
    amount: contribAmount,
    transactionId: investmentTx._id
  });

  console.log('✔ Seeded portfolio (2 holdings, 3 activities)');
}

async function invalidateCaches(userId) {
  const id = userId.toString();
  await cache.invalidateAnalyticsCache(id);
  await cache.invalidateTransactionsCache(id);
  await cache.del(`ref:${id}:categories:all`);
  await cache.del(`ref:${id}:categories:expense`);
  await cache.del(`ref:${id}:categories:income`);
  await cache.del(`ref:${id}:subcategories:all`);
  await cache.del(`ref:${id}:tags`);
  await cache.del(`ref:${id}:paymentMethods`);
}

async function seed() {
  console.log('🌱 FinanceNow screenshot seed');
  console.log(`   User: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log('');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await connectDB();

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1, 12, 0, 0, 0);
  const prevKey = monthKey(prevMonthStart);
  const currKey = monthKey(currMonthStart);

  console.log(`📅 Months: ${prevKey} (full) + ${currKey} (through day ${today.getDate()})`);
  console.log('');

  const user = await ensureUser();
  await clearUserData(user._id);
  const catalog = await seedCatalog(user._id);
  await seedTransactions(user._id, catalog, prevMonthStart, currMonthStart, today);
  await seedBudgets(user._id, catalog, prevKey, currKey);
  await seedSubscriptions(user._id, catalog, today, catalog.pmByName);
  await seedPortfolio(user._id, catalog, prevMonthStart, currMonthStart);
  await invalidateCaches(user._id);

  console.log('');
  console.log('✅ Seed complete — log in and capture screenshots.');
  console.log('   Dashboard: expense split, month-over-month comparison');
  console.log('   Budgets: Shopping over budget this month');
  console.log('   Subscriptions: Google One overdue, Netflix due soon');
  console.log('   Portfolio: ~₹2.15L across two mutual funds');

  await mongoose.connection.close();
}

if (require.main === module) {
  seed().catch(async (err) => {
    console.error('❌ Seed failed:', err);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  });
}

module.exports = { seed, TEST_EMAIL, TEST_PASSWORD };

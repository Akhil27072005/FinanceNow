/**
 * Development Seed Script
 * Seeds realistic test data for test@example.com user
 * 
 * Usage: node scripts/seedTestUser.js
 * 
 * Requirements:
 * - Server must be running on PORT (default: 5000)
 * - Test user must exist: test@example.com / test1234
 * - MongoDB must be connected
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'test1234';

// Global state
let accessToken = null;
let categoryIds = {};
let subCategoryIds = {};
let tagIds = {};

/**
 * Make authenticated API request
 */
async function apiRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error ${method} ${endpoint}:`, error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Authenticate as test user
 */
async function authenticate() {
  console.log('🔐 Authenticating...');
  try {
    const response = await apiRequest('POST', '/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.success && response.accessToken) {
      accessToken = response.accessToken;
      console.log(`✔ Authenticated as ${TEST_EMAIL}`);
      return true;
    } else {
      throw new Error('Authentication failed: No access token received');
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

/**
 * Get existing data (for idempotency check)
 */
async function getExistingData() {
  console.log('📋 Checking existing data...');
  try {
    const [categories, subcategories, tags, transactions, subscriptions, budgets] = await Promise.all([
      apiRequest('GET', '/categories').catch(() => ({ data: [] })),
      apiRequest('GET', '/subcategories').catch(() => ({ data: [] })),
      apiRequest('GET', '/tags').catch(() => ({ data: [] })),
      apiRequest('GET', '/transactions').catch(() => ({ data: [] })),
      apiRequest('GET', '/subscriptions').catch(() => ({ data: [] })),
      apiRequest('GET', '/budgets').catch(() => ({ data: [] }))
    ]);

    return {
      categories: categories.data || [],
      subcategories: subcategories.data || [],
      tags: tags.data || [],
      transactions: transactions.data || [],
      subscriptions: subscriptions.data || [],
      budgets: budgets.data || []
    };
  } catch (error) {
    console.error('❌ Error fetching existing data:', error.message);
    return {
      categories: [],
      subcategories: [],
      tags: [],
      transactions: [],
      subscriptions: [],
      budgets: []
    };
  }
}

/**
 * Delete existing data (for clean reseed)
 */
async function deleteExistingData(existing) {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in reverse order of dependencies
  for (const budget of existing.budgets) {
    await apiRequest('DELETE', `/budgets/${budget._id}`).catch(() => {});
  }
  
  for (const subscription of existing.subscriptions) {
    await apiRequest('DELETE', `/subscriptions/${subscription._id}`).catch(() => {});
  }
  
  for (const transaction of existing.transactions) {
    await apiRequest('DELETE', `/transactions/${transaction._id}`).catch(() => {});
  }
  
  for (const tag of existing.tags) {
    await apiRequest('DELETE', `/tags/${tag._id}`).catch(() => {});
  }
  
  for (const subcategory of existing.subcategories) {
    await apiRequest('DELETE', `/subcategories/${subcategory._id}`).catch(() => {});
  }
  
  for (const category of existing.categories) {
    await apiRequest('DELETE', `/categories/${category._id}`).catch(() => {});
  }
  
  console.log('✔ Existing data cleared');
}

/**
 * Seed Categories
 */
async function seedCategories() {
  console.log('📁 Seeding categories...');
  
  const categories = [
    { name: 'Income', type: 'income' },
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Rent', type: 'expense' },
    { name: 'Subscriptions', type: 'expense' },
    { name: 'Shopping', type: 'expense' }
  ];

  let created = 0;
  for (const cat of categories) {
    try {
      const response = await apiRequest('POST', '/categories', cat);
      if (response.success && response.data) {
        categoryIds[cat.name] = response.data._id;
        created++;
      }
    } catch (error) {
      // Category might already exist, try to find it
      try {
        const existing = await apiRequest('GET', '/categories');
        const found = existing.data?.find(c => c.name === cat.name && c.type === cat.type);
        if (found) {
          categoryIds[cat.name] = found._id || found._id?.toString();
        }
      } catch (fetchError) {
        // Ignore fetch errors
      }
    }
  }

  console.log(`✔ Categories seeded (${created})`);
  return created;
}

/**
 * Seed Subcategories
 */
async function seedSubcategories() {
  console.log('📂 Seeding subcategories...');
  
  const subcategories = [
    { categoryId: categoryIds['Income'], name: 'Salary' },
    { categoryId: categoryIds['Income'], name: 'Freelance' },
    { categoryId: categoryIds['Food'], name: 'Groceries' },
    { categoryId: categoryIds['Food'], name: 'Dining Out' },
    { categoryId: categoryIds['Transport'], name: 'Fuel' },
    { categoryId: categoryIds['Transport'], name: 'Public Transport' },
    { categoryId: categoryIds['Subscriptions'], name: 'Streaming' },
    { categoryId: categoryIds['Subscriptions'], name: 'Utilities' },
    { categoryId: categoryIds['Shopping'], name: 'Clothing' },
    { categoryId: categoryIds['Shopping'], name: 'Electronics' }
  ];

  let created = 0;
  for (const subcat of subcategories) {
    try {
      const response = await apiRequest('POST', '/subcategories', subcat);
      if (response.success && response.data) {
        subCategoryIds[subcat.name] = response.data._id;
        created++;
      }
    } catch (error) {
      // Subcategory might already exist
      const existing = await apiRequest('GET', '/subcategories');
      const found = existing.data?.find(s => s.name === subcat.name && 
        (s.categoryId?._id === subcat.categoryId || s.categoryId === subcat.categoryId));
      if (found) {
        subCategoryIds[subcat.name] = found._id;
      }
    }
  }

  console.log(`✔ Subcategories seeded (${created})`);
  return created;
}

/**
 * Seed Tags
 */
async function seedTags() {
  console.log('🏷️  Seeding tags...');
  
  const tags = [
    { name: 'essential', color: '#ef4444' },
    { name: 'recurring', color: '#3b82f6' },
    { name: 'non-essential', color: '#10b981' },
    { name: 'work', color: '#f59e0b' },
    { name: 'personal', color: '#8b5cf6' }
  ];

  let created = 0;
  for (const tag of tags) {
    try {
      const response = await apiRequest('POST', '/tags', tag);
      if (response.success && response.data) {
        tagIds[tag.name] = response.data._id;
        created++;
      }
    } catch (error) {
      // Tag might already exist
      const existing = await apiRequest('GET', '/tags');
      const found = existing.data?.find(t => t.name === tag.name);
      if (found) {
        tagIds[tag.name] = found._id;
      }
    }
  }

  console.log(`✔ Tags seeded (${created})`);
  return created;
}

/**
 * Generate random date within last 3 months
 */
function getRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const randomTime = threeMonthsAgo.getTime() + 
    Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  
  return new Date(randomTime);
}

/**
 * Seed Transactions
 */
async function seedTransactions() {
  console.log('💰 Seeding transactions...');
  
  const transactions = [];
  const now = new Date();
  
  // Generate 50-60 transactions over last 3 months
  const numTransactions = 54;
  
  // Monthly salary transactions (3 months)
  for (let month = 0; month < 3; month++) {
    const salaryDate = new Date(now);
    salaryDate.setMonth(salaryDate.getMonth() - month);
    salaryDate.setDate(1); // First of the month
    
    transactions.push({
      type: 'income',
      amount: 40000,
      date: salaryDate.toISOString().split('T')[0],
      categoryId: categoryIds['Income'],
      subCategoryId: subCategoryIds['Salary'],
      tags: [tagIds['essential'], tagIds['recurring'], tagIds['work']],
      paymentMethod: 'Bank Transfer',
      account: 'self',
      notes: 'Monthly salary'
    });
  }
  
  // Freelance income (random)
  for (let i = 0; i < 5; i++) {
    transactions.push({
      type: 'income',
      amount: Math.floor(Math.random() * 10000) + 5000, // ₹5,000 - ₹15,000
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Income'],
      subCategoryId: subCategoryIds['Freelance'],
      tags: [tagIds['work']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Freelance project'
    });
  }
  
  // Groceries (frequent)
  for (let i = 0; i < 12; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 1000) + 500, // ₹500 - ₹1,500
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Food'],
      subCategoryId: subCategoryIds['Groceries'],
      tags: [tagIds['essential'], tagIds['recurring']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Weekly groceries'
    });
  }
  
  // Dining Out
  for (let i = 0; i < 8; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 800) + 200, // ₹200 - ₹1,000
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Food'],
      subCategoryId: subCategoryIds['Dining Out'],
      tags: [tagIds['non-essential'], tagIds['personal']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Restaurant'
    });
  }
  
  // Transport - Fuel
  for (let i = 0; i < 6; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 500) + 500, // ₹500 - ₹1,000
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Transport'],
      subCategoryId: subCategoryIds['Fuel'],
      tags: [tagIds['essential'], tagIds['recurring']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Fuel'
    });
  }
  
  // Transport - Public Transport
  for (let i = 0; i < 10; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 200) + 50, // ₹50 - ₹250
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Transport'],
      subCategoryId: subCategoryIds['Public Transport'],
      tags: [tagIds['essential']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Metro/Bus'
    });
  }
  
  // Rent (monthly)
  for (let month = 0; month < 3; month++) {
    const rentDate = new Date(now);
    rentDate.setMonth(rentDate.getMonth() - month);
    rentDate.setDate(1);
    
    transactions.push({
      type: 'expense',
      amount: 15000,
      date: rentDate.toISOString().split('T')[0],
      categoryId: categoryIds['Rent'],
      tags: [tagIds['essential'], tagIds['recurring']],
      paymentMethod: 'Bank Transfer',
      account: 'self',
      notes: 'Monthly rent'
    });
  }
  
  // Shopping - Clothing
  for (let i = 0; i < 4; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 3000) + 1000, // ₹1,000 - ₹4,000
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Shopping'],
      subCategoryId: subCategoryIds['Clothing'],
      tags: [tagIds['non-essential'], tagIds['personal']],
      paymentMethod: 'Credit Card',
      account: 'self',
      notes: 'Clothing purchase'
    });
  }
  
  // Shopping - Electronics
  for (let i = 0; i < 2; i++) {
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 20000) + 5000, // ₹5,000 - ₹25,000
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds['Shopping'],
      subCategoryId: subCategoryIds['Electronics'],
      tags: [tagIds['non-essential']],
      paymentMethod: 'Credit Card',
      account: 'self',
      notes: 'Electronics purchase'
    });
  }
  
  // Fill remaining slots with random expenses
  const remaining = numTransactions - transactions.length;
  for (let i = 0; i < remaining; i++) {
    const categories = ['Food', 'Transport', 'Shopping'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    transactions.push({
      type: 'expense',
      amount: Math.floor(Math.random() * 2000) + 100, // ₹100 - ₹2,100
      date: getRandomDate().toISOString().split('T')[0],
      categoryId: categoryIds[category],
      tags: [tagIds['personal']],
      paymentMethod: 'UPI',
      account: 'self',
      notes: 'Misc expense'
    });
  }
  
  // Create transactions
  let created = 0;
  for (const transaction of transactions) {
    try {
      const response = await apiRequest('POST', '/transactions', transaction);
      if (response.success) {
        created++;
      }
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`✔ Transactions seeded (${created})`);
  return created;
}

/**
 * Seed Subscriptions
 */
async function seedSubscriptions() {
  console.log('💳 Seeding subscriptions...');
  
  const now = new Date();
  const subscriptions = [
    {
      name: 'Netflix',
      amount: 499,
      categoryId: categoryIds['Subscriptions'],
      billingCycle: 'monthly',
      nextPaymentDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      paymentMethod: 'Credit Card',
      isActive: true,
      autoRenew: true
    },
    {
      name: 'Spotify',
      amount: 119,
      categoryId: categoryIds['Subscriptions'],
      billingCycle: 'monthly',
      nextPaymentDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
      paymentMethod: 'Credit Card',
      isActive: true,
      autoRenew: true
    },
    {
      name: 'Google Drive',
      amount: 130,
      categoryId: categoryIds['Subscriptions'],
      billingCycle: 'monthly',
      nextPaymentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago (overdue)
      paymentMethod: 'Credit Card',
      isActive: true,
      autoRenew: true
    },
    {
      name: 'Mobile Recharge',
      amount: 239,
      categoryId: categoryIds['Subscriptions'],
      billingCycle: 'monthly',
      nextPaymentDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago (overdue)
      paymentMethod: 'UPI',
      isActive: true,
      autoRenew: true
    }
  ];

  let created = 0;
  for (const sub of subscriptions) {
    try {
      const response = await apiRequest('POST', '/subscriptions', sub);
      if (response.success) {
        created++;
      }
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`✔ Subscriptions seeded (${created})`);
  return created;
}

/**
 * Seed Budgets
 */
async function seedBudgets() {
  console.log('📊 Seeding budgets...');
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const budgets = [
    {
      categoryId: categoryIds['Food'],
      amount: 6000,
      month: currentMonth
    },
    {
      categoryId: categoryIds['Transport'],
      amount: 3000,
      month: currentMonth
    },
    {
      categoryId: categoryIds['Shopping'],
      amount: 5000,
      month: currentMonth
    }
  ];

  let created = 0;
  for (const budget of budgets) {
    try {
      const response = await apiRequest('POST', '/budgets', budget);
      if (response.success) {
        created++;
      }
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`✔ Budgets seeded (${created})`);
  return created;
}

/**
 * Main execution
 */
async function main() {
  console.log('🌱 Starting test data seeding...\n');
  
  try {
    // Authenticate
    await authenticate();
    
    // Check existing data
    const existing = await getExistingData();
    
    // If data exists, ask to clear (for dev, we'll auto-clear)
    const hasData = existing.categories.length > 0 || 
                    existing.transactions.length > 0 ||
                    existing.subscriptions.length > 0;
    
    if (hasData) {
      console.log('⚠️  Existing data found. Clearing for fresh seed...\n');
      await deleteExistingData(existing);
      // Reset IDs
      categoryIds = {};
      subCategoryIds = {};
      tagIds = {};
    }
    
    // Seed in order
    await seedCategories();
    await seedSubcategories();
    await seedTags();
    await seedTransactions();
    await seedSubscriptions();
    await seedBudgets();
    
    console.log('\n🎉 Test data seeding complete!');
    console.log('\n✅ You can now:');
    console.log('   - View dashboard with charts');
    console.log('   - Check analytics endpoints');
    console.log('   - See subscription reminders');
    console.log('   - Export CSV reports');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };


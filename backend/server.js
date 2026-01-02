const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Load environment variables FIRST before requiring other modules
dotenv.config();

const connectDB = require('./config/database');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent
})); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Session configuration (required by Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.ACCESS_TOKEN_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/subcategories', require('./routes/subcategory.routes'));
app.use('/api/tags', require('./routes/tag.routes'));
app.use('/api/payment-methods', require('./routes/paymentMethod.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/budgets', require('./routes/budget.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/export', require('./routes/export.routes'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


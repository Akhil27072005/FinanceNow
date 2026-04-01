# FinanceNow

A full-stack **personal finance** web application to track income, expenses, savings, and investments in one place. Built with the **MERN** stack (MongoDB, Express, React, Node.js), with optional **Redis (Upstash)** caching, **JWT** and **Google OAuth** authentication, and **Recharts**-powered analytics.

---

## Features

### Money tracking

- **Transactions** — Create, read, update, and delete entries with types: expense, income, savings, and investment.
- **Categories & subcategories** — Organize spending and income with a hierarchical structure.
- **Tags** — Label transactions for flexible filtering and reporting.
- **Payment methods** — Track which card, account, or method was used.

### Planning & recurring costs

- **Budgets** — Monthly limits tied to a category or subcategory, with spend vs. budget visibility.
- **Subscriptions** — Recurring charges with billing cycle, next payment date, and reminders.

### Insights & export

- **Dashboard** — KPIs (totals, savings rate, daily averages, subscription spend) and charts for selected months.
- **Reports** — Deeper analytics views driven by server-side aggregations.
- **CSV export** — Download transactions and subscriptions for backup or spreadsheets.

### Authentication & account

- **Email / password** — Register, login, JWT access + refresh tokens (refresh token also available in `localStorage`).
- **Google OAuth 2.0** — Sign in with Google (Passport.js); refresh token stored in an **HTTP-only cookie** for cross-origin refresh.
- **Password reset** — Forgot-password flow via **Nodemailer** (SMTP).

### Technical

- **REST API** under `/api/`* with consistent JSON responses.
- **MongoDB aggregations** for analytics and chart data.
- **Redis caching** (optional) for analytics, reference lists, budgets, and paginated transaction lists — app degrades gracefully if Redis is not configured.
- **CORS** configured for your frontend origin(s); supports comma-separated `FRONTEND_URL` and common Vercel preview patterns.

---

## Tech stack


| Layer            | Technologies                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React 18, React Router, Bootstrap / React-Bootstrap, Recharts, Axios, React DatePicker, Headless UI, Lucide / Iconify |
| **Backend**      | Node.js, Express.js, Mongoose (MongoDB), JWT, Passport (Google OAuth), cookie-parser, express-session                 |
| **Data & cache** | MongoDB, Upstash Redis (REST)                                                                                         |
| **Other**        | Nodemailer (email), json2csv (CSV export)                                                                             |


---

## Project structure

```
FinanceNow/
├── backend/                 # Express API
│   ├── config/              # DB, Redis, Passport
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Auth middleware
│   ├── routes/              # API route definitions
│   ├── src/models/          # Mongoose models (some legacy paths under models/)
│   ├── utils/               # Tokens, email, cache helpers
│   ├── scripts/             # e.g. seed test data
│   └── server.js            # App entry
├── frontend/                # Create React App
│   └── src/
│       ├── pages/           # Screens (Dashboard, Transactions, …)
│       ├── components/      # Layout, UI, modals
│       ├── contexts/        # Auth context
│       └── services/        # API clients
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 18 (frontend `engines` field)
- **MongoDB** connection string (Atlas or local)
- **npm** (or compatible package manager)

Optional:

- **Upstash Redis** for caching
- **Google Cloud** OAuth credentials for “Sign in with Google”
- **SMTP** account for password-reset emails

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd FinanceNow
```

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd ../frontend
npm install
```

### 2. Environment variables

Create `**backend/.env**` (never commit real secrets). Example template:

```env
# Required
MONGODB_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=your-long-random-secret
REFRESH_TOKEN_SECRET=your-other-long-random-secret

# Server
PORT=5000
NODE_ENV=development

# Frontend (CORS + redirects). Comma-separated for multiple origins
FRONTEND_URL=http://localhost:3000

# Optional: public API URL for OAuth callback default
BACKEND_URL=http://localhost:5000

# Optional: token lifetimes
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Optional: sessions (Passport)
SESSION_SECRET=another-random-secret

# Optional: Redis (Upstash) — if omitted, caching is disabled
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: SMTP (password reset)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Create `**frontend/.env**`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, set `REACT_APP_API_URL` to your deployed API base URL (must include `/api`).

### 3. Run in development

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

Default: [http://localhost:5000](http://localhost:5000)

**Terminal 2 — React app**

```bash
cd frontend
npm start
```

Default: [http://localhost:3000](http://localhost:3000)

**Health check**

```http
GET http://localhost:5000/api/health
```

### 4. Production build

**Frontend**

```bash
cd frontend
npm run build
```

Serve the `frontend/build` folder with any static host (e.g. Vercel, Netlify). Ensure `REACT_APP_API_URL` is set at **build time**.

**Backend**

```bash
cd backend
npm start
```

Set `NODE_ENV=production`, HTTPS-friendly cookie settings, and `FRONTEND_URL` to your real site origin(s).

---

## API overview

Base path: `**/api**`


| Area            | Prefix                 |
| --------------- | ---------------------- |
| Health          | `/api/health`          |
| Auth            | `/api/auth`            |
| Transactions    | `/api/transactions`    |
| Categories      | `/api/categories`      |
| Subcategories   | `/api/subcategories`   |
| Tags            | `/api/tags`            |
| Payment methods | `/api/payment-methods` |
| Subscriptions   | `/api/subscriptions`   |
| Budgets         | `/api/budgets`         |
| Analytics       | `/api/analytics`       |
| Export (CSV)    | `/api/export`          |


Protected routes expect:

```http
Authorization: Bearer <access_token>
```

---

## Google OAuth setup (summary)

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/).
2. Add **Authorized redirect URI**:
  `{BACKEND_URL}/api/auth/google/callback`  
   (or the exact value of `GOOGLE_CALLBACK_URL`).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `backend/.env`.
4. Ensure `FRONTEND_URL` matches where your React app is served (CORS + redirect after login).
5. In production, use **HTTPS**; the app sets `SameSite=None` and `Secure` on the refresh cookie when `NODE_ENV=production`.

---

## Seed test data (development)

The backend includes a script that logs in as a test user and populates sample data via the API.

**Requirements:** API running, MongoDB connected, user `test@example.com` / `test1234` already registered (register once through the UI or your own flow).

```bash
cd backend
npm run seed
```

Override API URL if needed:

```bash
set API_BASE_URL=http://localhost:5000/api   # Windows PowerShell: $env:API_BASE_URL="..."
npm run seed
```

---

## Scripts reference


| Location   | Command         | Description                |
| ---------- | --------------- | -------------------------- |
| `backend`  | `npm start`     | Run API (production-style) |
| `backend`  | `npm run dev`   | Run API with nodemon       |
| `backend`  | `npm run seed`  | Seed demo data (see above) |
| `frontend` | `npm start`     | Dev server                 |
| `frontend` | `npm run build` | Production build           |
| `frontend` | `npm test`      | Run tests (CRA)            |


---

## Security notes

- Keep `.env` files out of version control.
- Use strong, unique values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.
- Prefer HTTPS in production so secure cookies and OAuth behave correctly.
- The Google OAuth callback currently passes the access token in the URL query string; consider hardening with a one-time code exchange for production if you need stricter policies.

---

## License

This project is provided as-is for portfolio and learning use. Add a `LICENSE` file if you want to specify terms (e.g. MIT).


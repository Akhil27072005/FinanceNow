const publicUrl = process.env.PUBLIC_URL || '';

export const MARKETING_NAV_LINKS = [
  { label: 'Features', to: '/features', available: true },
  { label: 'Pricing', to: '/pricing', available: true },
  { label: 'About', to: '/about', available: true },
  { label: 'Blog', to: '/blog', available: false },
  { label: 'Contact', to: '/contact', available: true }
];

export const MARKETING_SCREENSHOTS = {
  dashboard: `${publicUrl}/marketing/dashboard.png`,
  transactions: `${publicUrl}/marketing/transactions.png`,
  budgets: `${publicUrl}/marketing/budgets.png`,
  reports: `${publicUrl}/marketing/reports.png`
};

export const FEATURES_PILLARS = [
  {
    id: 'track',
    label: 'Track',
    title: 'Capture every transaction',
    description: 'Log expenses, income, savings, and investments with the detail you need — not more.'
  },
  {
    id: 'plan',
    label: 'Plan',
    title: 'Budget with confidence',
    description: 'Set monthly limits, manage recurring bills, and know what is due before it hits your account.'
  },
  {
    id: 'understand',
    label: 'Understand',
    title: 'See the full picture',
    description: 'Dashboard summaries and reports that show where money goes — and how this month compares to last.'
  }
];

export const FEATURES_SHOWCASE = [
  {
    id: 'dashboard',
    pillar: 'Understand',
    title: 'Your month at a glance',
    description:
      'Income, expenses, savings, and spending splits on one screen. Compare this month to last and spot trends early.',
    bullets: [
      'Income vs expenses at a glance',
      'Expense breakdown by subcategory',
      'Savings and cash flow summary'
    ],
    image: MARKETING_SCREENSHOTS.dashboard,
    imageAlt: 'FinanceNow dashboard showing monthly income, expenses, and category splits'
  },
  {
    id: 'transactions',
    pillar: 'Track',
    title: 'Every transaction in one place',
    description:
      'Record spending with categories, subcategories, tags, and payment methods — then filter and find anything fast.',
    bullets: [
      'Expenses, income, savings, and investments',
      'Categories with icons you choose',
      'Tags and payment method tracking'
    ],
    image: MARKETING_SCREENSHOTS.transactions,
    imageAlt: 'FinanceNow transactions list with filters and category icons'
  },
  {
    id: 'budgets',
    pillar: 'Plan',
    title: 'Budgets that keep you honest',
    description:
      'Set monthly limits by category or subcategory. See spent vs planned at a glance and carry budgets forward.',
    bullets: [
      'Visual progress against your limits',
      'Category and subcategory budgets',
      'Copy budgets month to month'
    ],
    image: MARKETING_SCREENSHOTS.budgets,
    imageAlt: 'FinanceNow budgets page with progress bars and monthly limits'
  },
  {
    id: 'reports',
    pillar: 'Understand',
    title: 'Reports that answer real questions',
    description:
      'Dive into trends, payment method splits, and category breakdowns over any period you choose.',
    bullets: [
      'Income and expense trend charts',
      'Spending by payment method',
      'Category splits and period comparisons'
    ],
    image: MARKETING_SCREENSHOTS.reports,
    imageAlt: 'FinanceNow reports page with charts and financial KPIs'
  }
];

export const FEATURES_MORE = [
  {
    title: 'Subscriptions',
    description: 'Track recurring bills, due dates, and overdue payments in one view.'
  },
  {
    title: 'Investments',
    description: 'Log holdings and contributions alongside the rest of your finances.'
  },
  {
    title: 'Categories & subcategories',
    description: 'Build a catalog that matches how you actually spend and earn.'
  },
  {
    title: 'Tags',
    description: 'Add flexible labels for trips, projects, or anything spreadsheets cannot.'
  },
  {
    title: 'Payment methods',
    description: 'Cards, UPI, bank accounts — with icons and details that stay consistent.'
  },
  {
    title: 'Personalization',
    description: 'Currency, date format, themes, and glass intensity — make it yours.'
  }
];

export const ABOUT_ORIGIN = {
  title: 'Why FinanceNow exists',
  paragraphs: [
    'Like a lot of people, I started with spreadsheets. One tab for expenses, another for income, a third for savings, and formulas I was afraid to touch. It worked — until it didn\'t.',
    'Comparing this month to last meant copy-pasting rows. Subscriptions lived in my head. Budgets broke when I added a new category. On mobile it was even worse. The sheet became work, not clarity.',
    'FinanceNow is what I wanted instead: one place to log money in and out, set budgets, track subscriptions, and actually see the month — without maintaining a spreadsheet on the side.'
  ]
};

export const ABOUT_BELIEFS = [
  {
    id: 'clarity',
    label: 'Clarity',
    title: 'Month by month, not minute by minute',
    description:
      'Personal finance should give you a clear picture each month — not guilt you into logging every coffee.'
  },
  {
    id: 'one-place',
    label: 'One place',
    title: 'All money movement, together',
    description:
      'Expenses, income, savings, and investments belong in one flow — not scattered across tabs and files.'
  },
  {
    id: 'structure',
    label: 'Structure',
    title: 'Organized, but not rigid',
    description:
      'Categories when you want order, tags when life does not fit a box, and a UI you actually want to open.'
  }
];

export const ABOUT_SPREADSHEET_PAINS = [
  {
    problem: 'Multiple tabs for expenses, income, and savings',
    solution: 'One unified transaction model for every type of money movement'
  },
  {
    problem: 'Manual month-over-month comparisons',
    solution: 'Dashboard and reports with built-in period trends'
  },
  {
    problem: 'Subscriptions tracked separately — or not at all',
    solution: 'Dedicated subscriptions view with due dates and reminders'
  },
  {
    problem: 'Fragile budget formulas',
    solution: 'Visual budgets with spent vs planned progress'
  },
  {
    problem: 'Awkward logging on a phone',
    solution: 'A real app interface designed for quick entry and filtering'
  }
];

export const ABOUT_AUDIENCE = [
  'You have outgrown spreadsheets but do not want a bloated finance app',
  'You care about categories, budgets, and how this month compares to last',
  'You want subscriptions, investments, and day-to-day spending in one place',
  'You prefer clarity over complexity — structure without running a spreadsheet business'
];

export const ABOUT_IS = [
  'A personal finance hub for tracking, budgeting, and understanding your money',
  'Built for month-by-month clarity with categories, tags, and payment methods',
  'Actively developed — dashboard, transactions, budgets, reports, subscriptions, and more'
];

export const ABOUT_IS_NOT = [
  'A bank, payment processor, or automated bank-sync service',
  'Financial advice or investment recommendations',
  'A corporate expense tool — it is personal finance, first and foremost'
];

export const ABOUT_BUILDER = {
  title: 'Built with intent',
  paragraphs: [
    'FinanceNow began as a personal project to solve a real annoyance — and grew into the product you see today. It is designed, built, and improved with the same goal: make tracking money feel lighter than a spreadsheet.',
    'If you have feedback or ideas, we would love to hear them. This is a tool meant to be used every week, not admired once and forgotten.'
  ]
};

export const PRICING_PLAN = {
  name: 'Free',
  price: '₹0',
  period: 'No credit card required',
  description: 'Everything in FinanceNow today — one account, full access.',
  cta: 'Get started free'
};

export const PRICING_INCLUDED = [
  'Unlimited transactions (expenses, income, savings, investments)',
  'Dashboard with month-over-month insights',
  'Budgets by category or subcategory',
  'Reports, charts, and payment method splits',
  'Subscriptions and recurring bill tracking',
  'Investment portfolio logging',
  'Categories, subcategories, tags, and payment methods',
  'Themes, currency, and personalization settings'
];

export const PRICING_WHY_FREE = {
  title: 'Why is it free?',
  paragraphs: [
    'FinanceNow is in active development. The goal right now is to build something genuinely useful — and learn from people who use it every week.',
    'There are no hidden tiers or locked features behind a paywall today. If that changes in the future, we will be upfront about it long before anything you rely on disappears behind a subscription.'
  ]
};

export const PRICING_FAQ = [
  {
    question: 'Is FinanceNow really free?',
    answer:
      'Yes. You can create an account and use every feature available today at no cost. We are not charging while the product is growing.'
  },
  {
    question: 'Do I need a credit card to sign up?',
    answer: 'No. Registration only needs an email and password — or you can sign in with Google.'
  },
  {
    question: 'Are there usage limits?',
    answer:
      'There are no artificial caps on transactions, categories, or budgets today. Fair-use limits may apply only if needed to keep the service stable for everyone.'
  },
  {
    question: 'Will you sell my financial data?',
    answer:
      'No. Your transaction data is yours. We do not sell personal financial information to third parties.'
  },
  {
    question: 'Will you add paid plans later?',
    answer:
      'Possibly, as the product matures — but nothing you use for free today will suddenly become paid without clear notice. Any future pricing will be communicated openly.'
  },
  {
    question: 'Is this financial advice?',
    answer:
      'No. FinanceNow is a tracking and planning tool. It does not provide investment, tax, or legal advice.'
  }
];

export const CONTACT_TOPICS = [
  { value: 'support', label: 'Support', description: 'Help using the app or your account.' },
  { value: 'feature', label: 'Feature idea', description: 'Something you wish FinanceNow could do.' },
  { value: 'bug', label: 'Bug report', description: 'Something broken or not working as expected.' },
  { value: 'feedback', label: 'General feedback', description: 'Thoughts, praise, or honest criticism.' },
  { value: 'other', label: 'Other', description: 'Anything else you want the developer to know.' }
];

export const CONTACT_INTRO = {
  title: 'We read every message',
  description:
    'FinanceNow is built and maintained by a small team. Whether you need help, found a bug, or have an idea — send a note below.',
  replyNote:
    'After you send the form, check your inbox. If a reply is needed, we will reach out to the email address you provide.'
};

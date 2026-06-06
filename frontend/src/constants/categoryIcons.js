/**
 * Curated Iconify icons for per-category selection (not per transaction type).
 * Format: collection:name
 */

/** Suggested default when creating a new category (user can change in picker) */
export const SUGGESTED_ICON_BY_TYPE = {
  expense: 'lucide:shopping-bag',
  income: 'lucide:wallet',
  savings: 'lucide:piggy-bank',
  investment: 'lucide:trending-up'
};

export const FALLBACK_CATEGORY_ICON = 'lucide:tag';

export const CATEGORY_TYPES = [
  { id: 'expense', label: 'Expenses', description: 'Money going out' },
  { id: 'income', label: 'Income', description: 'Money coming in' },
  { id: 'savings', label: 'Savings', description: 'Money set aside' },
  { id: 'investment', label: 'Investments', description: 'Money invested' }
];

export const CATEGORY_TYPE_ACCENTS = {
  expense: { border: '#fecaca', bg: 'rgba(254, 226, 226, 0.35)', text: '#991b1b' },
  income: { border: '#bbf7d0', bg: 'rgba(209, 250, 229, 0.35)', text: '#065f46' },
  savings: { border: '#bfdbfe', bg: 'rgba(219, 234, 254, 0.35)', text: '#1e40af' },
  investment: { border: '#c7d2fe', bg: 'rgba(224, 231, 255, 0.35)', text: '#3730a3' }
};

/** Icon stroke/fill color on tiles and picker */
export const ICON_DISPLAY_COLORS = {
  'lucide:tag': '#6b7280',
  'lucide:shopping-bag': '#db2777',
  'lucide:shopping-cart': '#ea580c',
  'lucide:utensils': '#c2410c',
  'lucide:coffee': '#92400e',
  'lucide:car': '#2563eb',
  'lucide:bus': '#0284c7',
  'lucide:train': '#0369a1',
  'lucide:plane': '#7c3aed',
  'lucide:fuel': '#b45309',
  'lucide:home': '#059669',
  'lucide:building': '#475569',
  'lucide:lightbulb': '#ca8a04',
  'lucide:wifi': '#0891b2',
  'lucide:smartphone': '#4f46e5',
  'lucide:tv': '#9333ea',
  'lucide:gamepad-2': '#7c3aed',
  'lucide:music': '#ec4899',
  'lucide:film': '#6366f1',
  'lucide:heart': '#e11d48',
  'lucide:stethoscope': '#0d9488',
  'lucide:pill': '#14b8a6',
  'lucide:dumbbell': '#dc2626',
  'lucide:shirt': '#a855f7',
  'lucide:gift': '#f43f5e',
  'lucide:baby': '#f472b6',
  'lucide:dog': '#d97706',
  'lucide:book': '#2563eb',
  'lucide:graduation-cap': '#1d4ed8',
  'lucide:briefcase': '#334155',
  'lucide:laptop': '#0ea5e9',
  'lucide:wallet': '#059669',
  'lucide:credit-card': '#4f46e5',
  'lucide:banknote': '#16a34a',
  'lucide:landmark': '#1e40af',
  'lucide:piggy-bank': '#0284c7',
  'lucide:trending-up': '#4338ca',
  'lucide:chart-line': '#5b21b6',
  'lucide:coins': '#ca8a04',
  'lucide:bitcoin': '#f59e0b',
  'lucide:receipt': '#64748b',
  'lucide:file-text': '#6b7280',
  'lucide:shield': '#0f766e',
  'lucide:scale': '#57534e',
  'lucide:percent': '#b91c1c',
  'lucide:hand-coins': '#15803d',
  'lucide:circle-dollar-sign': '#16a34a',
  'lucide:sparkles': '#a855f7',
  'lucide:star': '#eab308',
  'lucide:zap': '#eab308',
  'lucide:leaf': '#22c55e',
  'lucide:flower-2': '#ec4899',
  'lucide:scissors': '#be185d',
  'lucide:wrench': '#78716c',
  'lucide:hammer': '#a16207',
  'lucide:package': '#d97706',
  'lucide:map-pin': '#ef4444',
  'lucide:calendar': '#6366f1',
  'lucide:users': '#0d9488',
  'lucide:hand-heart': '#e11d48',
  'lucide:church': '#7c3aed',
  'mdi:food': '#c2410c',
  'mdi:cart': '#ea580c',
  'mdi:home': '#059669',
  'mdi:car': '#2563eb',
  'mdi:gas-station': '#b45309',
  'mdi:hospital': '#e11d48',
  'mdi:school': '#1d4ed8',
  'mdi:wallet': '#059669',
  'mdi:credit-card': '#4f46e5',
  'mdi:chart-line': '#4338ca',
  'ph:wallet-duotone': '#059669',
  'ph:shopping-cart-duotone': '#db2777',
  'ph:house-duotone': '#0284c7',
  'ph:airplane-duotone': '#7c3aed'
};

const ICON_COLOR_PALETTE = [
  '#5b21b6',
  '#db2777',
  '#ea580c',
  '#059669',
  '#2563eb',
  '#0d9488',
  '#ca8a04',
  '#e11d48',
  '#7c3aed',
  '#0891b2'
];

export const getIconDisplayColor = (icon, categoryType) => {
  const id = getCategoryIcon(icon);
  if (ICON_DISPLAY_COLORS[id]) return ICON_DISPLAY_COLORS[id];
  if (categoryType && CATEGORY_TYPE_ACCENTS[categoryType]?.text) {
    return CATEGORY_TYPE_ACCENTS[categoryType].text;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ICON_COLOR_PALETTE[Math.abs(hash) % ICON_COLOR_PALETTE.length];
};

/** @type {{ id: string, label: string, keywords?: string }[]} */
export const CURATED_CATEGORY_ICONS = [
  { id: 'lucide:tag', label: 'Tag', keywords: 'default label' },
  { id: 'lucide:shopping-bag', label: 'Shopping', keywords: 'retail store buy' },
  { id: 'lucide:shopping-cart', label: 'Cart', keywords: 'grocery shop' },
  { id: 'lucide:utensils', label: 'Food', keywords: 'restaurant dining eat' },
  { id: 'lucide:coffee', label: 'Coffee', keywords: 'cafe drink' },
  { id: 'lucide:car', label: 'Car', keywords: 'transport vehicle drive' },
  { id: 'lucide:bus', label: 'Bus', keywords: 'transit public' },
  { id: 'lucide:train', label: 'Train', keywords: 'rail commute' },
  { id: 'lucide:plane', label: 'Travel', keywords: 'flight trip vacation' },
  { id: 'lucide:fuel', label: 'Fuel', keywords: 'gas petrol' },
  { id: 'lucide:home', label: 'Home', keywords: 'house rent mortgage' },
  { id: 'lucide:building', label: 'Building', keywords: 'office property' },
  { id: 'lucide:lightbulb', label: 'Utilities', keywords: 'electric bill power' },
  { id: 'lucide:wifi', label: 'Internet', keywords: 'wifi broadband' },
  { id: 'lucide:smartphone', label: 'Phone', keywords: 'mobile cellular' },
  { id: 'lucide:tv', label: 'TV', keywords: 'streaming entertainment' },
  { id: 'lucide:gamepad-2', label: 'Games', keywords: 'gaming fun' },
  { id: 'lucide:music', label: 'Music', keywords: 'audio subscription' },
  { id: 'lucide:film', label: 'Movies', keywords: 'cinema video' },
  { id: 'lucide:heart', label: 'Health', keywords: 'medical care' },
  { id: 'lucide:stethoscope', label: 'Medical', keywords: 'doctor hospital' },
  { id: 'lucide:pill', label: 'Pharmacy', keywords: 'medicine drug' },
  { id: 'lucide:dumbbell', label: 'Fitness', keywords: 'gym workout' },
  { id: 'lucide:shirt', label: 'Clothing', keywords: 'fashion apparel' },
  { id: 'lucide:gift', label: 'Gifts', keywords: 'present birthday' },
  { id: 'lucide:baby', label: 'Family', keywords: 'child kids' },
  { id: 'lucide:dog', label: 'Pets', keywords: 'animal vet' },
  { id: 'lucide:book', label: 'Education', keywords: 'school books course' },
  { id: 'lucide:graduation-cap', label: 'Tuition', keywords: 'university college' },
  { id: 'lucide:briefcase', label: 'Work', keywords: 'business job office' },
  { id: 'lucide:laptop', label: 'Tech', keywords: 'computer software' },
  { id: 'lucide:wallet', label: 'Wallet', keywords: 'cash money' },
  { id: 'lucide:credit-card', label: 'Card', keywords: 'credit debit payment' },
  { id: 'lucide:banknote', label: 'Cash', keywords: 'banknote bills' },
  { id: 'lucide:landmark', label: 'Bank', keywords: 'banking finance' },
  { id: 'lucide:piggy-bank', label: 'Savings', keywords: 'save piggy' },
  { id: 'lucide:trending-up', label: 'Invest', keywords: 'stocks growth' },
  { id: 'lucide:chart-line', label: 'Charts', keywords: 'market analytics' },
  { id: 'lucide:coins', label: 'Coins', keywords: 'crypto currency' },
  { id: 'lucide:bitcoin', label: 'Bitcoin', keywords: 'crypto btc' },
  { id: 'lucide:receipt', label: 'Receipt', keywords: 'invoice bill' },
  { id: 'lucide:file-text', label: 'Documents', keywords: 'paper files' },
  { id: 'lucide:shield', label: 'Insurance', keywords: 'protection policy' },
  { id: 'lucide:scale', label: 'Legal', keywords: 'law tax' },
  { id: 'lucide:percent', label: 'Tax', keywords: 'taxes percent' },
  { id: 'lucide:hand-coins', label: 'Salary', keywords: 'payroll income wage' },
  { id: 'lucide:circle-dollar-sign', label: 'Dollar', keywords: 'money income' },
  { id: 'lucide:sparkles', label: 'Misc', keywords: 'other random' },
  { id: 'lucide:star', label: 'Star', keywords: 'favorite special' },
  { id: 'lucide:zap', label: 'Energy', keywords: 'electric fast' },
  { id: 'lucide:leaf', label: 'Eco', keywords: 'green environment' },
  { id: 'lucide:flower-2', label: 'Personal', keywords: 'self care beauty' },
  { id: 'lucide:scissors', label: 'Salon', keywords: 'haircut grooming' },
  { id: 'lucide:wrench', label: 'Repairs', keywords: 'maintenance fix' },
  { id: 'lucide:hammer', label: 'Tools', keywords: 'hardware diy' },
  { id: 'lucide:package', label: 'Delivery', keywords: 'shipping parcel' },
  { id: 'lucide:map-pin', label: 'Location', keywords: 'place local' },
  { id: 'lucide:calendar', label: 'Events', keywords: 'schedule date' },
  { id: 'lucide:users', label: 'Social', keywords: 'friends group' },
  { id: 'lucide:hand-heart', label: 'Charity', keywords: 'donation help' },
  { id: 'lucide:church', label: 'Donations', keywords: 'religious charity' },
  { id: 'mdi:food', label: 'Food MDI', keywords: 'restaurant' },
  { id: 'mdi:cart', label: 'Cart MDI', keywords: 'shopping' },
  { id: 'mdi:home', label: 'Home MDI', keywords: 'house' },
  { id: 'mdi:car', label: 'Car MDI', keywords: 'vehicle' },
  { id: 'mdi:gas-station', label: 'Gas', keywords: 'fuel station' },
  { id: 'mdi:hospital', label: 'Hospital', keywords: 'health medical' },
  { id: 'mdi:school', label: 'School', keywords: 'education' },
  { id: 'mdi:wallet', label: 'Wallet MDI', keywords: 'money' },
  { id: 'mdi:credit-card', label: 'Card MDI', keywords: 'payment' },
  { id: 'mdi:chart-line', label: 'Chart MDI', keywords: 'invest stocks' },
  { id: 'ph:wallet-duotone', label: 'Wallet Ph', keywords: 'finance' },
  { id: 'ph:shopping-cart-duotone', label: 'Shop Ph', keywords: 'buy' },
  { id: 'ph:house-duotone', label: 'House Ph', keywords: 'home rent' },
  { id: 'ph:airplane-duotone', label: 'Fly Ph', keywords: 'travel' }
];

export const filterCategoryIcons = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return CURATED_CATEGORY_ICONS;
  return CURATED_CATEGORY_ICONS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.toLowerCase().includes(q))
  );
};

export const getCategoryIcon = (icon) => icon?.trim() || FALLBACK_CATEGORY_ICON;


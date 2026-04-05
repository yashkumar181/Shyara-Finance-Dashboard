import { Heart, CheckCircle2, Frown, BarChart3, Building2, Landmark } from 'lucide-react';

export const initialTransactions = [
  { id: 1, date: 'Oct 24, 2023', time: '14:22', merchant: 'Apple Store', desc: 'Electronics / Wants', catMain: 'Lifestyle', catSub: 'Tech', source: 'Axis CC', sourceLast: '4421', amount: '-$1,299.00', amountType: 'negative', status: 'Cleared', icon: 'Laptop', iconBg: 'bg-gray-100', iconColor: 'text-gray-600', sourceIcon: 'CreditCard', tag1: { label: 'Tech', color: 'bg-blue-100 text-blue-700', active: true } },
  { id: 2, date: 'Oct 23, 2023', time: '09:00', merchant: 'Stripe Payout', desc: 'Contract Work', catMain: 'Income', catSub: 'Freelance', source: 'HDFC Salary', sourceLast: '9021', amount: '+$4,250.00', amountType: 'positive', status: 'Cleared', icon: 'Laptop', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', sourceIcon: 'Landmark', tag1: { label: 'Income', color: 'bg-emerald-100 text-emerald-700', active: true } },
  { id: 3, date: 'Oct 21, 2023', time: '19:30', merchant: 'Whole Foods', desc: 'Groceries', catMain: 'Housing', catSub: 'Groceries', source: 'FinTech Wallet', sourceLast: 'UPI', amount: '-$142.50', amountType: 'negative', status: 'Pending', icon: 'ShoppingCart', iconBg: 'bg-green-100', iconColor: 'text-green-600', sourceIcon: 'Wallet', tag1: { label: 'Essential', color: 'bg-orange-100 text-orange-700', active: true } },
];

export const merchantsData = [
  { id: 1, initial: 'A', name: 'Amazon Web Services', sub: 'ENTERPRISE CLOUD', amount: '$1,842.10', freq: 'Monthly Bill', bg: 'bg-blue-100 dark:bg-gray-800', text: 'text-blue-600 dark:text-gray-300' },
  { id: 2, initial: 'T', name: 'Tesla Supercharger', sub: 'TRANSIT', amount: '$412.50', freq: '12 Transactions', bg: 'bg-indigo-100 dark:bg-gray-800', text: 'text-indigo-600 dark:text-gray-300' },
  { id: 3, initial: 'W', name: 'Whole Foods Market', sub: 'PROVISIONING', amount: '$942.00', freq: '8 Transactions', bg: 'bg-blue-100 dark:bg-gray-800', text: 'text-blue-600 dark:text-gray-300' },
];

export const chartDataMap = {
  daily: [{ label: 'Mon', income: 450, expense: 320 }, { label: 'Tue', income: 420, expense: 410 }, { label: 'Wed', income: 510, expense: 290 }, { label: 'Thu', income: 480, expense: 380 }, { label: 'Fri', income: 600, expense: 520 }, { label: 'Sat', income: 300, expense: 650 }, { label: 'Sun', income: 250, expense: 400 }],
  weekly: [{ label: 'Wk 1', income: 4200, expense: 3100 }, { label: 'Wk 2', income: 4500, expense: 3800 }, { label: 'Wk 3', income: 4100, expense: 2900 }, { label: 'Wk 4', income: 5600, expense: 4200 }],
  monthly: [{ label: 'Jan', income: 18400, expense: 12300 }, { label: 'Feb', income: 18400, expense: 14000 }, { label: 'Mar', income: 19200, expense: 13100 }, { label: 'Apr', income: 18400, expense: 11500 }, { label: 'May', income: 21000, expense: 15200 }, { label: 'Jun', income: 18400, expense: 10400 }]
};

export const subscriptionsData = [
  { id: 1, name: 'Netflix', plan: 'Premium 4K Plan', initial: 'N', bg: 'bg-black dark:bg-[#121212]', text: 'text-white', cycle: 'MONTHLY', next: 'OCT 14', rating: 'Loved', ratingIcon: Heart, ratingColor: 'text-red-600 dark:text-red-400', ratingBg: 'bg-red-50 dark:bg-red-900/20', cost: '$19.99', subCost: '' },
  { id: 2, name: 'Spotify', plan: 'Family Plan', initial: 'S', bg: 'bg-green-500 dark:bg-green-600', text: 'text-white', cycle: 'MONTHLY', next: 'OCT 22', rating: 'Loved', ratingIcon: Heart, ratingColor: 'text-red-600 dark:text-red-400', ratingBg: 'bg-red-50 dark:bg-red-900/20', cost: '$16.99', subCost: '' },
  { id: 3, name: 'Google One', plan: '2TB Storage', initial: 'G', bg: 'bg-blue-100 dark:bg-gray-800', text: 'text-blue-600 dark:text-gray-300', cycle: 'ANNUAL', next: 'MAR 2024', rating: 'Constant', ratingIcon: CheckCircle2, ratingColor: 'text-[#0A3D8B] dark:text-blue-400', ratingBg: 'bg-blue-50 dark:bg-blue-900/20', cost: '$9.99', subCost: '$99.99/yr' },
  { id: 4, name: 'Masterclass', plan: 'All-Access Pass', initial: 'M', bg: 'bg-black dark:bg-[#121212]', text: 'text-white', cycle: 'ANNUAL', next: 'NOV 02', rating: 'Rarely Used', ratingIcon: Frown, ratingColor: 'text-red-700 dark:text-orange-400', ratingBg: 'bg-red-100 dark:bg-orange-900/20', cost: '$15.00', subCost: '$180.00/yr' },
];

export const investmentsData = [
  { id: 1, name: 'Nvidia Corp (NVDA)', type: 'EQUITY • 42 UNITS', icon: BarChart3, iconBg: 'bg-blue-100 dark:bg-gray-800', iconColor: 'text-blue-700 dark:text-gray-300', value: '$48,421.10', dayChange: '+4.2%', dayChangeType: 'positive', totalGain: '+$18,200.00', roi: '60.2%', gainType: 'positive', goal: 'WEALTH GEN' },
  { id: 2, name: 'Blue Ridge REIT', type: 'REAL ESTATE • MONTHLY DIV', icon: Building2, iconBg: 'bg-orange-100 dark:bg-gray-800', iconColor: 'text-orange-700 dark:text-gray-300', value: '$125,000.00', dayChange: '0.0%', dayChangeType: 'neutral', totalGain: '+$12,400.00', roi: '11.0%', gainType: 'positive', goal: 'RETIREMENT' },
  { id: 3, name: 'Vanguard Global Tech Fund', type: 'MUTUAL FUND • GROWTH', icon: Landmark, iconBg: 'bg-gray-100 dark:bg-[#121212]', iconColor: 'text-gray-700 dark:text-gray-400', value: '$64,120.30', dayChange: '-0.8%', dayChangeType: 'negative', totalGain: '+$8,920.00', roi: '16.2%', gainType: 'positive', goal: 'COLLEGE' }
];
export const portfolioPerformanceData = [
  { month: 'Jan', invested: 250000, current: 260000 },
  { month: 'Feb', invested: 260000, current: 275000 },
  { month: 'Mar', invested: 270000, current: 280000 },
  { month: 'Apr', invested: 280000, current: 270000 },
  { month: 'May', invested: 290000, current: 310000 },
  { month: 'Jun', invested: 300000, current: 340000 },
  { month: 'Jul', invested: 312000, current: 428592 }
];
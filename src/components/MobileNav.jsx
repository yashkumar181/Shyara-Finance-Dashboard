import React from 'react';
import { NavLink } from 'react-router-dom';
// ADD Lightbulb to imports
import { LayoutDashboard, CreditCard, ReceiptText, TrendingUp, RefreshCw, Target, PieChart, Lightbulb } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const MobileNav = () => {
  const { preferences } = useAppStore();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/accounts', icon: CreditCard, label: 'Accounts' },
    { to: '/transactions', icon: ReceiptText, label: 'Transactions' },
    // ADD NEW INSIGHTS ROUTE HERE
    { to: '/insights', icon: Lightbulb, label: 'Insights' },
    { to: '/budget', icon: PieChart, label: 'Budget' },
    { to: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
    { to: '/investments', icon: TrendingUp, label: 'Investments' },
    { to: '/goals', icon: Target, label: 'Goals' }
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.to === '/budget') return preferences?.showBudget !== false;
    if (item.to === '/subscriptions') return preferences?.showSubscriptions !== false;
    if (item.to === '/investments') return preferences?.showInvestments !== false;
    if (item.to === '/goals') return preferences?.showGoals !== false;
    return true; // Dashboard, Accounts, Transactions, Insights always show
  });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F8F9FA] dark:bg-[#121212] border-t border-gray-200 dark:border-[#262626] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <ul className="flex justify-between items-center h-16 pb-safe px-1">
        {visibleNavItems.map((item) => (
          <li key={item.to} className="flex-1 min-w-0 h-full">
            <NavLink 
              to={item.to}
              className={({ isActive }) => `flex flex-col items-center justify-center h-full space-y-1 transition-colors ${isActive ? 'text-[#0A3D8B] dark:text-gray-100' : 'text-gray-400 dark:text-[#a3a3a3]'}`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-medium truncate w-full text-center px-0.5">
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileNav;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ReceiptText, TrendingUp, RefreshCw, Target } from 'lucide-react';

const MobileNav = () => {
  // Mapped exactly to Shyara's names and icons, excluding Settings
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/accounts', icon: CreditCard, label: 'Accounts' },
    { to: '/transactions', icon: ReceiptText, label: 'Transactions' },
    { to: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
    { to: '/investments', icon: TrendingUp, label: 'Investments' },
    { to: '/goals', icon: Target, label: 'Goals' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F8F9FA] dark:bg-[#121212] border-t border-gray-200 dark:border-[#262626] z-50 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <ul className="flex justify-between items-center h-16 pb-safe">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1 min-w-0 h-full">
            <NavLink 
              to={item.to}
              className={({ isActive }) => `flex flex-col items-center justify-center h-full space-y-1 transition-colors ${isActive ? 'text-[#0A3D8B] dark:text-gray-100' : 'text-gray-400 dark:text-[#a3a3a3]'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-medium truncate w-full text-center px-0.5">
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
import React, { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Header = ({ setIsMobileMenuOpen }) => {
  const user = useAppStore(state => state.user);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const openCommandMenu = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="h-16 md:h-20 bg-[#F8F9FA] dark:bg-[#121212] flex items-center justify-between px-4 md:px-10 border-b border-gray-200 dark:border-[#262626] shrink-0 transition-colors">
      <div className="flex items-center space-x-4 md:space-x-8 flex-1">
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-400 hover:text-gray-600 dark:text-[#a3a3a3] dark:hover:text-gray-200 p-1 -ml-2 rounded-md transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block relative w-full max-w-sm cursor-pointer" onClick={openCommandMenu}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#a3a3a3]" />
          <div className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0a0a0a] text-gray-400 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#262626] rounded-lg text-xs flex justify-between items-center transition-colors hover:border-gray-300 dark:hover:border-gray-500 shadow-sm">
            <span>Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-[#121212] px-1.5 font-mono text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#262626]"><span className="text-xs">⌘</span>K</kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-6 shrink-0">
        <button onClick={openCommandMenu} className="sm:hidden text-gray-400 dark:text-[#a3a3a3] p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#262626] transition-colors"><Search className="w-5 h-5" /></button>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-400 dark:text-[#a3a3a3] hover:text-[#0F172A] dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#262626] transition-all">
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="text-gray-400 dark:text-[#a3a3a3] hover:text-[#0F172A] dark:hover:text-white relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#262626] transition-all hidden sm:block">
          <Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#F8F9FA] dark:border-[#121212]"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-2 sm:border-l border-gray-200 dark:border-[#262626]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#0F172A] dark:text-gray-200">{user?.name || 'Premium Member'}</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-[#a3a3a3] tracking-wider uppercase">{user?.email || 'Active Account'}</p>
          </div>
          <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=121212&color=fff`} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-sm border border-gray-200 dark:border-[#262626]" />
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import logo from '../assets/logo.jpg'; 

const Header = ({ setIsMobileMenuOpen }) => {
  const { signOut } = useClerk();
  const { user } = useUser();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
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

  const displayName = user?.fullName || user?.firstName || 'Premium Member';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || 'Active Account';
  const photoURL = user?.imageUrl || `https://ui-avatars.com/api/?name=${displayName}&background=0A3D8B&color=fff&bold=true`;

  return (
    <header className="h-16 md:h-20 bg-[#F8F9FA] dark:bg-[#121212] flex items-center justify-between px-4 md:px-10 border-b border-gray-200 dark:border-[#262626] shrink-0 transition-colors relative z-40">
      <div className="flex items-center space-x-4 md:space-x-8 flex-1">
        
        <div className="flex items-center md:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-400 hover:text-gray-600 dark:text-[#a3a3a3] dark:hover:text-gray-200 p-1 -ml-2 rounded-md transition-colors mr-3">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Shyara" className="w-6 h-6 object-contain" />
            <span className="font-bold text-[#0F172A] dark:text-white text-lg tracking-tight">Shyara Finance</span>
          </div>
        </div>

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
        
        <div className="relative">
          <button onClick={() => {setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false);}} className="text-gray-400 dark:text-[#a3a3a3] hover:text-[#0F172A] dark:hover:text-white relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#262626] transition-all hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#F8F9FA] dark:border-[#121212]"></span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-2xl shadow-xl p-6 z-50 text-center animate-fade-slide-up">
              <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">No new notifications</p>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] mt-1 uppercase tracking-widest">You're all caught up!</p>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            onClick={() => {setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false);}}
            className="flex items-center space-x-3 pl-2 sm:border-l border-gray-200 dark:border-[#262626] cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-gray-200">{displayName}</p>
              <p className="text-[10px] font-bold text-gray-400 dark:text-[#a3a3a3] tracking-wider uppercase">Active Account</p>
            </div>
            <img src={photoURL} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-sm border border-gray-200 dark:border-[#262626]" />
          </div>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-slide-up">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#121212]">
                <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200 truncate">{displayName}</p>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] truncate mt-0.5">{displayEmail}</p>
              </div>
              <div className="p-2">
                <button onClick={() => signOut()} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center transition-colors">
                  <LogOut className="w-4 h-4 mr-3" /> Secure Log Out
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Header;
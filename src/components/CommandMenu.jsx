import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, CreditCard, ReceiptText, TrendingUp, RefreshCw, Target, PieChart, Settings, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const CommandMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  const openTransactionSheet = useAppStore((state) => state.openTransactionSheet);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { section: 'Pages', name: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { section: 'Pages', name: 'Accounts', icon: CreditCard, action: () => navigate('/accounts') },
    { section: 'Pages', name: 'Transactions', icon: ReceiptText, action: () => navigate('/transactions') },
    { section: 'Pages', name: 'Investments', icon: TrendingUp, action: () => navigate('/investments') },
    { section: 'Pages', name: 'Subscriptions', icon: RefreshCw, action: () => navigate('/subscriptions') },
    { section: 'Pages', name: 'Budget', icon: PieChart, action: () => navigate('/budget') },
    { section: 'Pages', name: 'Goals', icon: Target, action: () => navigate('/goals') },
    { section: 'Pages', name: 'Settings', icon: Settings, action: () => navigate('/settings') },
    { section: 'Actions', name: 'Add New Transaction', icon: Plus, action: () => openTransactionSheet() }
  ];

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      <div className="relative w-full max-w-lg bg-[#F8F9FA] dark:bg-[#121212] rounded-xl shadow-2xl border border-gray-200 dark:border-[#262626] overflow-hidden flex flex-col animate-fade-slide-up">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-[#262626]">
          <Search className="w-5 h-5 text-gray-400 dark:text-[#a3a3a3] mr-3 shrink-0" />
          <input
            ref={inputRef} type="text" placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[#0F172A] dark:text-gray-200 text-sm focus:outline-none placeholder-gray-400 dark:placeholder-[#a3a3a3]"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-[#a3a3a3]">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <p className="p-4 text-sm text-center text-gray-500 dark:text-[#a3a3a3]">No results found.</p>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { item.action(); setIsOpen(false); }}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors text-left group"
                >
                  <item.icon className="w-4 h-4 text-gray-400 dark:text-[#a3a3a3] group-hover:text-[#0A3D8B] dark:group-hover:text-gray-200 mr-3 shrink-0" />
                  <span className="text-sm font-medium text-[#0F172A] dark:text-gray-200">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandMenu;
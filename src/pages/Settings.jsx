import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  PenLine, Target, Banknote, Plus, Landmark, CreditCard, Wallet, 
  Bot, Users, Settings as CogIcon, Download, History, Trash2, AlertTriangle, 
  PieChart, TrendingUp, Calendar
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Settings = () => {
  const { user } = useUser();
  const api = useApi();
  const navigate = useNavigate();
  
  // Pull accounts, transactions, AND our new preferences from the global store
  const { accounts, transactions, preferences, updatePreference } = useAppStore();

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Toggle handler for the global store
  const togglePref = (key) => {
    updatePreference(key, !preferences[key]);
  };

  const primaryAccount = accounts.find(a => a.is_default) || accounts.find(a => a.account_type !== 'credit_card') || null;
  const creditCardsCount = accounts.filter(a => a.account_type === 'credit_card').length;
  const walletsCount = accounts.filter(a => a.account_type === 'wallet').length;

  const handleExportAll = () => {
    if (!transactions || transactions.length === 0) return alert("No transactions to export.");
    const headers = "Date,Merchant,Description,Category,Account,Amount,Type\n";
    const csvRows = transactions.map(tx => 
      `"${new Date(tx.date).toLocaleDateString()}","${tx.merchant || tx.name || ''}","${tx.notes || ''}","${tx.category}","${tx.accountName || ''}","${tx.amount}","${tx.type}"`
    ).join("\n");
    const blob = new Blob([headers + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePurgeData = async () => {
    setIsPurging(true);
    try {
      await api.purgeAllData();
      localStorage.clear();
      window.location.href = '/'; 
    } catch (error) {
      alert("Failed to purge data. Please try again.");
      setIsPurging(false);
    }
  };

  // Map out our modular UI toggles
  const appModules = [
    { id: 'showBudget', name: 'Budget Pacing', icon: PieChart, desc: 'Category envelopes and pacing.' },
    { id: 'showInvestments', name: 'Investment Portfolio', icon: TrendingUp, desc: 'Stock and Mutual Fund tracking.' },
    { id: 'showGoals', name: 'Strategic Goals', icon: Target, desc: 'Milestone and saving targets.' },
    { id: 'showSubscriptions', name: 'Subscriptions', icon: Calendar, desc: 'Recurring monthly charges.' }
  ];

  return (
    <div className="flex-1 overflow-auto p-4 pb-28 md:p-10 md:pb-10 relative">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Architect your financial environment and data privacy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center mb-1">
                <Users className="w-5 h-5 mr-2 text-[#0A3D8B] dark:text-gray-400" />
                Profile
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Manage your identity and financial details.</p>
            </div>
            <button className="text-xs font-bold text-[#0A3D8B] dark:text-gray-400 flex items-center hover:underline">
              Edit Profile <PenLine className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{user?.fullName || 'Premium User'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">PAN Number</p>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-600 italic">Hidden for security</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{user?.primaryEmailAddress?.emailAddress || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{user?.primaryPhoneNumber?.phoneNumber || 'Not Linked'}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center mb-1">
            <CogIcon className="w-5 h-5 mr-2 text-[#0A3D8B] dark:text-gray-400" />
            Workspace Modules
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6">Toggle pages on or off to clean up your navigation menu.</p>

          <div className="space-y-3">
            {appModules.map((mod) => {
              const Icon = mod.icon;
              // Safe fallback to true if undefined
              const isToggled = preferences?.[mod.id] !== false; 
              
              return (
                <div key={mod.id} className="flex justify-between items-center bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm">
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3 text-gray-500 dark:text-[#a3a3a3]" /> 
                    <div>
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{mod.name}</p>
                    </div>
                  </div>
                  <div onClick={() => togglePref(mod.id)} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors shrink-0 ${isToggled ? 'bg-[#0A3D8B] dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${isToggled ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Accounts & Cards</h2>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Manage linked financial institutions and physical assets.</p>
          </div>
          <button onClick={() => navigate('/accounts')} className="flex items-center justify-center px-4 py-2 bg-[#0A3D8B] dark:bg-gray-700 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-gray-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Manage Accounts
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryAccount ? (
            <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-md text-white flex flex-col justify-between h-48 border border-transparent dark:border-[#262626]">
              <div className="flex justify-between items-start">
                <Landmark className="w-6 h-6 text-white" />
                <span className="bg-white/20 text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">Primary</span>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 dark:text-gray-400 mb-1">{primaryAccount.bank_name || 'Bank Account'}</p>
                <h3 className="text-lg font-bold tracking-wider mb-4">{primaryAccount.nickname}</h3>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-blue-200 dark:text-gray-400">Bal: ₹{parseFloat(primaryAccount.balance).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Active</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-md text-white flex flex-col items-center justify-center h-48 border border-transparent dark:border-[#262626]">
              <Landmark className="w-8 h-8 text-blue-300 mb-3" />
              <span className="text-xs font-bold text-blue-200">No Primary Account Linked</span>
            </div>
          )}

          <div className="bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-2xl p-6 flex flex-col items-center justify-center h-48">
            <CreditCard className="w-8 h-8 text-[#0A3D8B] dark:text-[#a3a3a3] mb-3" />
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-gray-200">{creditCardsCount}</h3>
            <span className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-1">Cards Linked</span>
          </div>

          <div className="bg-[#F0F5FF] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-[#262626] flex flex-col justify-between h-48">
            <Wallet className="w-6 h-6 text-[#0A3D8B] dark:text-gray-400" />
            <div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">{walletsCount} Wallets</h3>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] mb-4">Digital Payment Sources</p>
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3]">Live Synced</p>
                <button onClick={() => navigate('/accounts')} className="text-[10px] font-bold text-[#0A3D8B] dark:text-gray-400 uppercase tracking-widest hover:underline">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-[#262626] flex items-center justify-center text-green-600 dark:text-gray-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">WhatsApp Bot</h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Transact via secure automated messaging.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Default Source Account</p>
              <select className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-bold rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500">
                {accounts.filter(a => a.account_type !== 'credit_card').map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.nickname} (Bal: ₹{parseFloat(acc.balance).toLocaleString('en-IN')})</option>
                ))}
                {accounts.length === 0 && <option>No accounts available</option>}
              </select>
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Confirmation Mode</p>
                <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3]">Ask for OTP for every WhatsApp transaction</p>
              </div>
              <div onClick={() => togglePref('whatsappOtp')} className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors shrink-0 ${preferences?.whatsappOtp !== false ? 'bg-[#0A3D8B] dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${preferences?.whatsappOtp !== false ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-8 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30 flex flex-col justify-between opacity-70">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-[#262626] flex items-center justify-center text-[#0A3D8B] dark:text-gray-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Family Setup <span className="ml-2 text-[8px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">COMING SOON</span></h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Share expenses and premium features.</p>
            </div>
          </div>

          <div className="space-y-3 pointer-events-none">
            <div className="bg-white dark:bg-[#1E1E1E] p-3 rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">P2</div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Player 2</p>
                  <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3]">Joint Member</p>
                </div>
              </div>
              <CogIcon className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3]" />
            </div>

            <button className="w-full bg-transparent border border-dashed border-[#0A3D8B] dark:border-gray-500 text-[#0A3D8B] dark:text-gray-400 rounded-xl py-3 text-xs font-bold transition-colors">
              + Invite Family Member
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="max-w-md">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-1">Data Governance</h2>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Control your financial footprint. Download your entire history or selectively purge sensitive data records.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={handleExportAll} className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" /> Export Ledger
          </button>
          <button onClick={() => setIsPurgeModalOpen(true)} className="flex items-center justify-center px-4 py-2.5 bg-[#FFEFEA] dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/40 border border-transparent dark:border-red-900/30 transition-colors shadow-sm whitespace-nowrap">
            <Trash2 className="w-4 h-4 mr-2" /> Purge Data
          </button>
        </div>
      </div>

      {isPurgeModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPurgeModalOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up p-8 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-3">Initialize Data Purge?</h2>
            <p className="text-sm text-gray-500 dark:text-[#a3a3a3] mb-8 leading-relaxed">
              This action will permanently delete <span className="font-bold text-red-600 dark:text-red-400">all transactions, accounts, investments, budgets, and goals</span> from the database. This cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setIsPurgeModalOpen(false)} disabled={isPurging} className="flex-1 py-3.5 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#333] text-[#0F172A] dark:text-gray-200 rounded-xl text-sm font-bold transition-colors border border-gray-200 dark:border-transparent">Abort</button>
              <button onClick={handlePurgeData} disabled={isPurging} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50">
                {isPurging ? 'Purging...' : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Settings;
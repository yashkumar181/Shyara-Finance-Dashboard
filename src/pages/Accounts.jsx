import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Building2, Wallet, CreditCard, Plus, X, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Accounts = () => {
  const api = useApi();
  const { accounts, setAccounts, setAccountsLoading } = useAppStore();

  const [isReconciling, setIsReconciling] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [selectedAccountDetail, setSelectedAccountDetail] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const [newAccountData, setNewAccountData] = useState({ name: '', subtitle: '', type: 'bank', balance: '', limit: '' });

  useEffect(() => {
    const loadData = async () => {
      setAccountsLoading(true);
      try {
        const data = await api.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setAccountsLoading(false);
      }
    };
    if (accounts.length === 0) loadData();
  }, [api, setAccounts, setAccountsLoading, accounts.length]);

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => setIsReconciling(false), 1500);
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    const newAcc = {
      id: Date.now().toString(),
      account_type: newAccountData.type === 'credit' ? 'credit_card' : newAccountData.type,
      nickname: newAccountData.name,
      provider: newAccountData.subtitle,
      balance: newAccountData.type !== 'credit' ? parseFloat(newAccountData.balance) || 0 : 0,
      outstanding: newAccountData.type === 'credit' ? parseFloat(newAccountData.balance) || 0 : 0,
      credit_limit: parseFloat(newAccountData.limit) || 0,
      currency: 'INR'
    };
    
    setAccounts([...accounts, newAcc]);
    setIsAddAccountOpen(false);
    setNewAccountData({ name: '', subtitle: '', type: 'bank', balance: '', limit: '' });
  };

  const handleDeleteAccount = (id) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  // Live Calculations
  const liquidAccounts = accounts.filter(a => a.account_type !== 'credit_card');
  const creditAccounts = accounts.filter(a => a.account_type === 'credit_card');

  const totalAssets = liquidAccounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
  const totalLiabilities = creditAccounts.reduce((sum, acc) => sum + (parseFloat(acc.outstanding) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const liquidityRatio = totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : '∞';

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Accounts & Cards</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Real-time consolidated view of your architectural capital.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsAddAccountOpen(true)} className="flex items-center justify-center px-4 py-2 bg-[#F8F9FA] dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </button>
          <button onClick={handleReconcile} disabled={isReconciling} className="flex items-center justify-center px-4 py-2 bg-[#0A3D8B] dark:bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-[#082f6b] dark:hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-70 whitespace-nowrap">
            <RefreshCw className={`w-4 h-4 mr-2 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling...' : 'Account Reconciliation'}
          </button>
        </div>
      </div>

      {/* LIVE SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-2 uppercase">Net Worth</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30">
          <p className="text-[10px] font-bold text-gray-500 dark:text-blue-300 tracking-wider mb-2 uppercase">Total Assets</p>
          <h3 className="text-2xl font-bold text-[#0A3D8B] dark:text-blue-400">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-[#FFF0F0] dark:bg-[#3A1C1C] p-6 rounded-2xl shadow-sm border border-red-50 dark:border-red-900/30 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-500 dark:text-red-300 tracking-wider mb-2 uppercase">Total Liabilities</p>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">-₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
          <svg className="absolute bottom-0 right-0 w-24 h-12 text-red-200 dark:text-red-900/50" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M0,50 L20,30 L40,40 L60,10 L80,20 L100,0 L100,50 Z" fill="currentColor" opacity="0.3" />
            <path d="M0,50 L20,30 L40,40 L60,10 L80,20 L100,0" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-2 uppercase">Liquidity Ratio</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">{liquidityRatio}</h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-1 space-y-8">
          {/* LIVE LIQUID ACCOUNTS */}
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
              <span className="px-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Cash & Liquid Accounts</span>
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liquidAccounts.map((acc, i) => (
                <div key={acc.id || i} className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-56 animate-fade-slide-up">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${acc.account_type === 'wallet' ? 'bg-purple-50 dark:bg-[#262626] text-purple-600' : 'bg-blue-50 dark:bg-[#262626] text-blue-600'}`}>
                        {acc.account_type === 'wallet' ? <Wallet className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{acc.nickname || acc.provider}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold tracking-wider">{acc.account_type === 'wallet' ? 'Linked Wallet' : 'Bank Account'}</p>
                      </div>
                    </div>
                    {i === 0 && <span className="bg-orange-100 dark:bg-[#262626] text-orange-700 dark:text-orange-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-transparent dark:border-[#262626]">Active</span>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Available Balance</p>
                    <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3]">Currency: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{acc.currency || 'INR'}</span></p>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => handleDeleteAccount(acc.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setSelectedAccountDetail(acc)} className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-400 uppercase tracking-wider hover:underline">DETAILS</button>
                    </div>
                  </div>
                </div>
              ))}
              {liquidAccounts.length === 0 && (
                <div className="col-span-2 text-center text-sm text-gray-500 py-10 border-2 border-dashed rounded-2xl dark:border-[#262626]">No liquid accounts found.</div>
              )}
            </div>
          </div>

          {/* LIVE CREDIT CARDS */}
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
              <span className="px-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Credit & Liabilities</span>
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
            </div>

            <div className="space-y-6">
              {creditAccounts.map((card, i) => {
                const limit = parseFloat(card.credit_limit) || 1;
                const outstanding = parseFloat(card.outstanding) || 0;
                const utilization = Math.min(Math.round((outstanding / limit) * 100), 100);

                return (
                  <div key={card.id || i} className="bg-[#212735] dark:bg-[#1A1F2C] p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center text-white h-auto sm:h-40 relative overflow-hidden gap-6 border border-transparent dark:border-[#262626] animate-fade-slide-up">
                    <div className="absolute right-0 top-0 opacity-10 w-64 h-64 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                      <CreditCard className="w-full h-full" />
                    </div>
                    <div className="flex flex-col justify-between h-full z-10 w-full sm:w-auto flex-1">
                      <div className="flex items-center space-x-3 mb-6 sm:mb-4">
                        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="flex-1 flex justify-between items-start pr-4">
                          <div>
                            <h4 className="text-sm font-bold text-white">{card.nickname || card.provider}</h4>
                            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Credit Card</p>
                          </div>
                          <button onClick={() => handleDeleteAccount(card.id)} className="text-gray-400 hover:text-red-400 transition-colors ml-4 pt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-8 sm:space-x-12">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 tracking-widest mb-1 uppercase">Current Due</p>
                          <h3 className="text-xl font-bold text-white">₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 tracking-widest mb-1 uppercase">Credit Limit</p>
                          <h3 className="text-xl font-bold text-white">₹{parseFloat(card.credit_limit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 z-10 shrink-0 self-center sm:mr-4">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path className="text-gray-700" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-blue-300" strokeWidth="4" strokeDasharray={`${utilization}, 100`} stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="block text-sm font-bold">{utilization}%</span>
                        <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Used</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {creditAccounts.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-10 border-2 border-dashed rounded-2xl dark:border-[#262626]">No credit cards found.</div>
              )}
            </div>
          </div>
        </div>

        {/* STATIC INSIGHTS COLUMN */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-8 rounded-2xl shadow-md text-white relative overflow-hidden h-72 flex flex-col justify-between border border-transparent dark:border-[#262626]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-4 inline-block">Pro Insight</span>
              <h3 className="text-lg font-bold mb-3">Optimize Your Liabilities</h3>
              <p className="text-xs text-blue-100 leading-relaxed opacity-90">
                Your credit utilization is at a healthy 19%. Consider transferring your HDFC balance to yield 0.5% higher APY.
              </p>
            </div>
            <button className="relative z-10 w-full bg-white dark:bg-[#121212] text-[#0A3D8B] dark:text-gray-200 font-bold text-xs py-3 rounded-lg mt-4 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors border border-transparent dark:border-[#262626]">
              Review Strategy
            </button>
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-6">Liability Breakdown</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Housing Loan</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">₹48,200</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Credit Cards</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">₹12,480</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[20%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Personal Lines</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">₹3,800</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-red-800 dark:bg-red-500 w-[10%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATIC RECENT CLEARING SECTION */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Recent Clearing</h2>
          <button onClick={() => setShowAuditLog(true)} className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-400 uppercase tracking-widest hover:underline">VIEW AUDIT LOG</button>
        </div>
        
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626] bg-gray-100 dark:bg-[#0a0a0a]">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest w-1/2">Counterparty / Description</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-[#262626] text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">AM</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Amazon Marketplace</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 22, 2023 • 14:22</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">Axis CC (4421)</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 dark:bg-[#262626] text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Settled</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-[#0F172A] dark:text-gray-200">-₹124.50</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-[#262626] text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">SC</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Stripe Corporate Payout</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 21, 2023 • 09:00</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">HDFC Salary (9021)</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 dark:bg-[#262626] text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Cleared</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹4,250.00</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-[#262626] text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">UW</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Uber Wallet Refill</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 21, 2023 • 18:45</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">FinTech Wallet</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-50 dark:bg-[#262626] text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Pending</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-[#0F172A] dark:text-gray-200">-₹25.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS PORTALS --- */}
      
      {isAddAccountOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddAccountOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Account / Card</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Link an asset or liability</p>
              </div>
              <button onClick={() => setIsAddAccountOpen(false)} className="text-gray-400 hover:text-[#0F172A] dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Account / Card Name</label>
                <input required type="text" value={newAccountData.name} onChange={e => setNewAccountData({...newAccountData, name: e.target.value})} placeholder="e.g. Chase Sapphire, HDFC Saving" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Type</label>
                  <select value={newAccountData.type} onChange={e => setNewAccountData({...newAccountData, type: e.target.value, balance: '', limit: ''})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500">
                    <option value="bank">Bank Account</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="credit">Credit Card</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">{newAccountData.type === 'credit' ? 'Current Due (₹)' : 'Current Balance (₹)'}</label>
                  <input required type="number" step="0.01" value={newAccountData.balance} onChange={e => setNewAccountData({...newAccountData, balance: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${newAccountData.type === 'credit' ? 'col-span-1' : 'col-span-2'}`}>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Identifier / Subtitle</label>
                  <input required type="text" value={newAccountData.subtitle} onChange={e => setNewAccountData({...newAccountData, subtitle: e.target.value})} placeholder="e.g. XXXX-1234 or UPI Link" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
                </div>
                {newAccountData.type === 'credit' && (
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Credit Limit (₹)</label>
                    <input required type="number" step="0.01" value={newAccountData.limit} onChange={e => setNewAccountData({...newAccountData, limit: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg mt-4">Save & Link Entity</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedAccountDetail && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAccountDetail(null)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up p-6">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedAccountDetail.account_type === 'wallet' ? 'bg-purple-50 dark:bg-[#262626] text-purple-600' : 'bg-blue-50 dark:bg-[#262626] text-blue-600'}`}>
                {selectedAccountDetail.account_type === 'wallet' ? <Wallet className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
              </div>
              <button onClick={() => setSelectedAccountDetail(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">{selectedAccountDetail.nickname || selectedAccountDetail.provider}</h2>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] font-semibold tracking-wider mb-6">{selectedAccountDetail.account_type}</p>
            <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] mb-6">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Available Balance</p>
              <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{parseFloat(selectedAccountDetail.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
            </div>
            <button onClick={() => setSelectedAccountDetail(null)} className="w-full py-3 bg-gray-200 dark:bg-[#262626] hover:bg-gray-300 dark:hover:bg-[#333333] text-[#0F172A] dark:text-gray-200 rounded-xl text-sm font-bold transition-colors">Close</button>
          </div>
        </div>,
        document.body
      )}

      {/* RESTORED: Audit Log Modal */}
      {showAuditLog && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuditLog(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-lg rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#0A3D8B] dark:text-gray-400"/> System Audit Log</h2>
              </div>
              <button onClick={() => setShowAuditLog(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Reconciliation Successful</p>
                  <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">All 12 linked accounts synced. No discrepancies found.</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#666666] font-bold tracking-widest mt-1 uppercase">Today, 14:02 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Credit Limit Update Detected</p>
                  <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Axis Privilege CC limit increased to ₹25,000.00.</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#666666] font-bold tracking-widest mt-1 uppercase">Yesterday, 09:15 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Accounts;
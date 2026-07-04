import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const TransactionSheet = ({ isOpen, onClose }) => {
  const api = useApi();
  const { transactions, setTransactions, setAccounts, setDashboard, setBudget } = useAppStore(); 

  const [accountsList, setAccountsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetCategoryNames, setBudgetCategoryNames] = useState([]);
  const [showMerchantSuggestions, setShowMerchantSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    merchant: '',
    notes: '', // <-- NEW: Added notes field
    amount: '',
    type: 'expense',
    category: 'Lifestyle',
    accountId: '', 
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        try {
          const data = await api.getAccounts();
          setAccountsList(data || []);
          if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, accountId: data[0].id.toString() }));
          }
        } catch (error) {
          console.error(error);
        }
      };
      const fetchBudgetCategoryNames = async () => {
        try {
          const budgetData = await api.getBudget();
          const names = (budgetData?.categories || []).map(c => c.name).filter(Boolean);
          setBudgetCategoryNames(names);
        } catch (error) {
          console.error("Failed to fetch budget categories for merchant suggestions", error);
        }
      };
      fetchAccounts();
      fetchBudgetCategoryNames();
    }
  }, [isOpen, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      alert("Please select a valid Funding Source first.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newTx = await api.createTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type, 
        merchant: formData.merchant,
        notes: formData.notes, // <-- NEW: Send notes to backend
        category: formData.category,
        account_id: parseInt(formData.accountId), 
        date: new Date(formData.date).toISOString()
      });

      setTransactions([newTx, ...transactions]);
      
      try {
         const [freshAccounts, freshDashboard, freshBudget] = await Promise.all([
           api.getAccounts(),
           api.getDashboard(),
           api.getBudget()
         ]);
         
         if (freshAccounts) setAccounts(freshAccounts);
         if (freshDashboard) setDashboard(freshDashboard);
         if (freshBudget) setBudget(freshBudget);
      } catch (syncErr) {
         console.error("Background sync failed:", syncErr);
      }

      setFormData({ merchant: '', notes: '', amount: '', type: 'expense', category: 'Lifestyle', accountId: accountsList[0]?.id || '', date: new Date().toISOString().split('T')[0] });
      onClose();
    } catch (error) {
      console.error("Failed to commit transaction:", error);
      alert("Failed to save transaction. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-300 ${isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      <div className={`absolute inset-y-0 right-0 z-10 w-full max-w-md bg-[#F8F9FA] dark:bg-[#121212] border-l border-gray-200 dark:border-[#262626] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Record</h2>
            <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Live Database Entry</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="tx-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Merchant / Entity</label>
                <div className="relative">
                  <input 
                    required type="text" autoComplete="off" value={formData.merchant} 
                    onChange={(e) => { setFormData({...formData, merchant: e.target.value}); setShowMerchantSuggestions(true); }}
                    onFocus={() => setShowMerchantSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowMerchantSuggestions(false), 150)}
                    placeholder="e.g. Apple Store" 
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                  />
                  {showMerchantSuggestions && budgetCategoryNames.filter(name => name.toLowerCase().includes(formData.merchant.toLowerCase())).length > 0 && (
                    <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-xl shadow-lg overflow-hidden">
                      {budgetCategoryNames
                        .filter(name => name.toLowerCase().includes(formData.merchant.toLowerCase()))
                        .map(name => (
                          <div
                            key={name}
                            onMouseDown={() => { setFormData({...formData, merchant: name}); setShowMerchantSuggestions(false); }}
                            className="px-4 py-2.5 text-sm font-semibold text-[#0F172A] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                          >
                            {name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Description</label>
                <input 
                  type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Monthly bill" 
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Amount (₹)</label>
                <input 
                  required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" 
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Type</label>
                <select 
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Category Allocation</label>
              <div className="grid grid-cols-2 gap-3">
                {['Lifestyle', 'Housing', 'Income', 'Travel'].map((cat) => (
                  <div 
                    key={cat} onClick={() => setFormData({...formData, category: cat})}
                    className={`cursor-pointer px-4 py-3 rounded-xl border text-center text-xs font-bold transition-all ${formData.category === cat ? 'bg-[#0A3D8B] dark:bg-gray-800 text-white border-transparent' : 'bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-[#a3a3a3] border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-gray-500'}`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Funding Source</label>
                <select 
                  required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
                >
                  {accountsList.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.nickname}</option>
                  ))}
                  {accountsList.length === 0 && <option value="" disabled>No accounts found</option>}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Date</label>
                <input 
                  required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
          <button 
            type="submit" form="tx-form" disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Syncing...' : 'Commit to Ledger'} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransactionSheet;
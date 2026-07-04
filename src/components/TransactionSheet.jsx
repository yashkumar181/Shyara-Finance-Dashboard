import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const TransactionSheet = ({ isOpen, onClose }) => {
  const api = useApi();
  const { transactions, setTransactions, setAccounts, setDashboard, setBudget } = useAppStore(); 

  const [accountsList, setAccountsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetCategoryNames, setBudgetCategoryNames] = useState([]);
  const [showMerchantSuggestions, setShowMerchantSuggestions] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  // Custom Alert Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, accountName: '', balance: 0, amount: 0, actualAccountId: null });
  
  const [formData, setFormData] = useState({
    merchant: '',
    notes: '',
    amount: '',
    type: 'expense',
    category: 'Lifestyle',
    customCategory: '',
    accountId: '', 
    cashSourceId: '', 
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
          console.error("Failed to fetch budget categories", error);
        }
      };
      fetchAccounts();
      fetchBudgetCategoryNames();
    }
  }, [isOpen, api]);

  const executeTransaction = async (actualAccountId, parsedAmount) => {
    setIsSubmitting(true);
    
    try {
      const finalCategory = showCustomCategory && formData.customCategory.trim() !== '' 
        ? formData.customCategory.trim() 
        : formData.category;

      const newTx = await api.createTransaction({
        amount: parsedAmount,
        type: formData.type, 
        merchant: formData.merchant,
        notes: formData.notes,
        category: finalCategory,
        account_id: parseInt(actualAccountId), 
        paymentMethod: formData.accountId === 'cash' ? 'Cash' : 'Online',
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

      setFormData({ merchant: '', notes: '', amount: '', type: 'expense', category: 'Lifestyle', customCategory: '', accountId: accountsList[0]?.id || '', cashSourceId: '', date: new Date().toISOString().split('T')[0] });
      setShowCustomCategory(false);
      onClose();
    } catch (error) {
      console.error("Failed to commit transaction:", error);
      alert("Failed to save transaction. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const actualAccountId = formData.accountId === 'cash' ? formData.cashSourceId : formData.accountId;
    
    if (!actualAccountId) {
      alert(formData.accountId === 'cash' ? "Please select a source account for the cash." : "Please select a valid Funding Source first.");
      return;
    }

    const targetAccount = accountsList.find(a => a.id.toString() === actualAccountId);
    const parsedAmount = parseFloat(formData.amount);

    // Trigger Custom Alert if Insufficient Balance
    if (formData.type === 'expense' && targetAccount && targetAccount.account_type !== 'credit_card') {
      if (parsedAmount > parseFloat(targetAccount.balance)) {
        setConfirmModal({
          isOpen: true,
          accountName: targetAccount.nickname,
          balance: targetAccount.balance,
          amount: parsedAmount,
          actualAccountId: actualAccountId
        });
        return; // Pause execution until user confirms in the modal
      }
    }

    // If balance is sufficient, proceed immediately
    executeTransaction(actualAccountId, parsedAmount);
  };

  return createPortal(
    <>
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
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {['Lifestyle', 'Housing', 'Travel', 'Income', 'Custom'].map((cat) => {
                    const isSelected = (!showCustomCategory && formData.category === cat) || (showCustomCategory && cat === 'Custom');
                    return (
                      <div 
                        key={cat} 
                        onClick={() => {
                          if (cat === 'Custom') setShowCustomCategory(true);
                          else {
                            setShowCustomCategory(false);
                            setFormData({...formData, category: cat});
                          }
                        }}
                        className={`cursor-pointer px-4 py-3 rounded-xl border text-center text-xs font-bold transition-all ${isSelected ? 'bg-[#0A3D8B] dark:bg-gray-800 text-white border-transparent' : 'bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-[#a3a3a3] border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-gray-500'}`}
                      >
                        {cat}
                      </div>
                    );
                  })}
                </div>
                {showCustomCategory && (
                  <input 
                    required type="text" value={formData.customCategory} onChange={(e) => setFormData({...formData, customCategory: e.target.value})} placeholder="Enter custom category..." 
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-[#0A3D8B] dark:border-gray-500 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none transition-colors shadow-sm mb-4"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={formData.accountId === 'cash' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Funding Source</label>
                  <select 
                    required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
                  >
                    <option value="cash" className="font-bold text-[#0A3D8B]">💵 Cash (Wallet/Physical)</option>
                    {accountsList.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.nickname}</option>
                    ))}
                    {accountsList.length === 0 && <option value="" disabled>No accounts found</option>}
                  </select>
                </div>

                {formData.accountId === 'cash' && (
                  <div className="col-span-2 bg-blue-50 dark:bg-gray-800/50 p-4 rounded-xl border border-blue-100 dark:border-gray-700">
                    <label className="block text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">Source of this Cash</label>
                    <select 
                      required value={formData.cashSourceId} onChange={(e) => setFormData({...formData, cashSourceId: e.target.value})}
                      className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-blue-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
                    >
                      <option value="" disabled>Select which account the cash was withdrawn from...</option>
                      {accountsList.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.nickname}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={formData.accountId === 'cash' ? 'col-span-2' : ''}>
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
      </div>

      {/* --- INSUFFICIENT BALANCE CUSTOM MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
          
          <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-2xl p-6 transform transition-all scale-100 opacity-100">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-5">
              <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-center text-[#0F172A] dark:text-gray-200 mb-2">Insufficient Balance</h3>
            
            <p className="text-sm text-center text-gray-600 dark:text-[#a3a3a3] mb-6 leading-relaxed">
              Your <span className="font-bold text-[#0F172A] dark:text-gray-300">{confirmModal.accountName}</span> account only has <span className="font-bold text-red-500">₹{confirmModal.balance.toLocaleString('en-IN')}</span>, but you are trying to record an expense of <span className="font-bold text-[#0F172A] dark:text-gray-300">₹{confirmModal.amount.toLocaleString('en-IN')}</span>.
              <br /><br />
              Do you want to log this anyway? The account will show a negative balance.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-3 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  executeTransaction(confirmModal.actualAccountId, confirmModal.amount);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default TransactionSheet;
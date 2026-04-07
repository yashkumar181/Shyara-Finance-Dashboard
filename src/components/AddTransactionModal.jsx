import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Wallet, Calendar, Tag, FileText } from 'lucide-react';
import { useApi } from '../lib/api';

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const api = useApi();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        try {
          const data = await api.getAccounts();
          setAccounts(data || []);
          if (data && data.length > 0) {
            setAccountId(data[0].id.toString());
          }
        } catch (error) {
          console.error("Failed to fetch accounts for modal", error);
        }
      };
      fetchAccounts();
    }
  }, [isOpen, api]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    setIsLoading(true);
    try {
      await api.createTransaction({
        type,
        amount: parseFloat(amount),
        merchant,
        category,
        account_id: parseInt(accountId),
        date
      });
      
      // Reset form
      setAmount('');
      setMerchant('');
      setCategory('');
      
      if (onTransactionAdded) onTransactionAdded();
      onClose();
    } catch (error) {
      console.error("Failed to save transaction", error);
      alert("Error saving transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Log Transaction</h2>
            <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Record capital movement</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl mb-6">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${type === 'expense' ? 'bg-white dark:bg-[#262626] text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              <ArrowUpRight className="w-4 h-4 mr-1.5" /> Expense
            </button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${type === 'income' ? 'bg-white dark:bg-[#262626] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              <ArrowDownRight className="w-4 h-4 mr-1.5" /> Income
            </button>
          </div>

          <div className="space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Amount (₹)</label>
              <input required autoFocus type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-4 text-2xl font-bold bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
            </div>

            {/* Merchant & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Merchant/Entity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FileText className="w-4 h-4 text-gray-400" /></div>
                  <input required type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Amazon" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className="w-4 h-4 text-gray-400" /></div>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:text-white appearance-none cursor-pointer">
                    <option value="" disabled>Select...</option>
                    {type === 'expense' ? (
                      <>
                        <option value="Dining">Dining</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Investment">Investment</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Account & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Funding Source</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wallet className="w-4 h-4 text-gray-400" /></div>
                  <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:text-white appearance-none cursor-pointer">
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.nickname}</option>
                    ))}
                    {accounts.length === 0 && <option value="" disabled>No accounts found</option>}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="w-4 h-4 text-gray-400" /></div>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <button disabled={isLoading} type="submit" className="w-full mt-8 py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-70">
            {isLoading ? 'Processing...' : 'Confirm Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    type: 'negative',
    category: 'Lifestyle',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTx = {
      id: Date.now(),
      date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      merchant: formData.merchant,
      desc: 'Manual Entry',
      catMain: formData.category,
      catSub: 'General',
      source: 'Manual Entry',
      sourceLast: 'XXXX',
      amount: formData.type === 'negative' ? `-₹${parseFloat(formData.amount).toFixed(2)}` : `+₹${parseFloat(formData.amount).toFixed(2)}`,
      amountType: formData.type,
      status: 'Cleared',
      icon: 'ShoppingCart',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      sourceIcon: 'CreditCard'
    };

    addTransaction(newTx);
    setFormData({ merchant: '', amount: '', type: 'negative', category: 'Lifestyle', date: new Date().toISOString().split('T')[0] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-md relative z-10 shadow-2xl border dark:border-white/10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Merchant / Entity</label>
            <input 
              required
              type="text" 
              value={formData.merchant}
              onChange={(e) => setFormData({...formData, merchant: e.target.value})}
              placeholder="e.g. Amazon, Salary" 
              className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
              <input 
                required
                type="number" 
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00" 
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Transaction Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors"
              >
                <option value="negative">Expense</option>
                <option value="positive">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors"
              >
                <option>Lifestyle</option>
                <option>Housing</option>
                <option>Income</option>
                <option>Travel</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
              <input 
                required
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#121212] border border-gray-200 dark:border-white/10 text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white/5 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#0A3D8B] dark:bg-gray-700 hover:bg-[#082f6b] dark:hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
              Log Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
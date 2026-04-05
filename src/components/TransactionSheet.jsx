import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // <-- Imported createPortal
import { X, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const TransactionSheet = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();

  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    type: 'negative',
    category: 'Lifestyle',
    date: new Date().toISOString().split('T')[0]
  });

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
      amount: formData.type === 'negative' ? `-$${parseFloat(formData.amount).toFixed(2)}` : `+$${parseFloat(formData.amount).toFixed(2)}`,
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

  // We use createPortal to attach this directly to the <body> tag.
  // We also removed the unmounting logic so the CSS transitions trigger smoothly.
  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose}
      ></div>
      
      {/* Slide-out Sheet */}
      <div 
        className={`absolute inset-y-0 right-0 z-10 w-full max-w-md bg-[#F8F9FA] dark:bg-[#121212] border-l border-gray-200 dark:border-[#262626] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Record</h2>
            <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Transaction Ledger</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="tx-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Merchant / Entity</label>
              <input 
                required
                type="text" 
                value={formData.merchant}
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                placeholder="e.g. Apple Store, Uber" 
                className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Amount ($)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00" 
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
                >
                  <option value="negative">Expense</option>
                  <option value="positive">Income</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Category Allocation</label>
              <div className="grid grid-cols-2 gap-3">
                {['Lifestyle', 'Housing', 'Income', 'Travel'].map((cat) => (
                  <div 
                    key={cat}
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`cursor-pointer px-4 py-3 rounded-xl border text-center text-xs font-bold transition-all ${formData.category === cat ? 'bg-[#0A3D8B] dark:bg-gray-800 text-white border-transparent' : 'bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-[#a3a3a3] border-gray-200 dark:border-[#262626] hover:border-gray-300 dark:hover:border-gray-500'}`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Transaction Date</label>
              <input 
                required
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
          <button type="submit" form="tx-form" className="w-full flex items-center justify-center py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg">
            Commit to Ledger <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransactionSheet;
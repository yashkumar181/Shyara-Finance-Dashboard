import React from 'react';
import { PieChart, AlertTriangle, CheckCircle2, TrendingUp, Filter } from 'lucide-react';

const Budget = () => {
  const budgetCategories = [
    { name: 'Housing & Utilities', allocated: 2500, spent: 2450, color: 'bg-blue-500' },
    { name: 'Groceries & Dining', allocated: 800, spent: 620, color: 'bg-emerald-500' },
    { name: 'Transportation', allocated: 400, spent: 380, color: 'bg-violet-500' },
    { name: 'Leisure & Entertainment', allocated: 300, spent: 350, color: 'bg-red-500', over: true },
    { name: 'Subscriptions', allocated: 150, spent: 120, color: 'bg-amber-500' },
  ];

  const totalAllocated = budgetCategories.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgetCategories.reduce((acc, curr) => acc + curr.spent, 0);
  const totalPercentage = Math.min((totalSpent / totalAllocated) * 100, 100).toFixed(1);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Budget Command</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Monitor category thresholds and spending velocity.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
          <Filter className="w-4 h-4 mr-2" /> Current Month: Oct 2023
        </button>
      </div>

      {/* Top Summary */}
      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-[#262626] flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="4" className={totalPercentage > 95 ? "text-red-500" : "text-[#0A3D8B] dark:text-gray-400"} strokeDasharray={`${totalPercentage}, 100`}></circle>
            </svg>
            <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{totalPercentage}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Total Monthly Budget</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-[#0F172A] dark:text-gray-200">₹{totalSpent.toLocaleString()}</h2>
              <span className="text-sm font-bold text-gray-400 dark:text-gray-600">/ ₹{totalAllocated.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] flex items-start gap-4 w-full md:max-w-md shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-1">Spending Velocity is Optimal</p>
            <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] leading-relaxed">You are currently 4% under your projected spend for this time of the month. Great job managing Leisure expenses.</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-4">Category Envelope Limits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {budgetCategories.map((cat, idx) => {
          const percent = Math.min((cat.spent / cat.allocated) * 100, 100);
          return (
            <div key={idx} className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{cat.name}</h3>
                </div>
                {cat.over ? (
                  <span className="flex items-center text-[9px] font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded uppercase tracking-widest"><AlertTriangle className="w-3 h-3 mr-1" /> Over Limit</span>
                ) : (
                  <span className="flex items-center text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> On Track</span>
                )}
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <p className="text-lg font-bold text-[#0F172A] dark:text-gray-200">₹{cat.spent}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-[#a3a3a3]">Limit: ₹{cat.allocated}</p>
              </div>
              
              <div className="w-full h-2.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${cat.over ? 'bg-red-500' : cat.color}`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  );
};

export default Budget;
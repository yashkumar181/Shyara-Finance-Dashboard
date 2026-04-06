import React, { useEffect } from 'react';
import { PieChart, AlertTriangle, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Budget = () => {
  const api = useApi();
  const { budget, setBudget, budgetLoading, setBudgetLoading, dashboard } = useAppStore();

  useEffect(() => {
    const loadBudget = async () => {
      setBudgetLoading(true);
      try {
        const data = await api.getBudget(); // Ensure route exists
        setBudget(data);
      } catch (error) {
        console.error("Budget fetch error:", error);
      } finally {
        setBudgetLoading(false);
      }
    };
    if (!budget) loadBudget();
  }, [api, budget, setBudget, setBudgetLoading]);

  // Fallback to local state if DB isn't seeded with categories yet
  const defaultCategories = [
    { name: 'Housing & Utilities', allocated: 25000, spent: 24500, color: 'bg-blue-500' },
    { name: 'Groceries & Dining', allocated: 15000, spent: 12200, color: 'bg-emerald-500' },
    { name: 'Transportation', allocated: 8000, spent: 7800, color: 'bg-violet-500' },
    { name: 'Leisure & Entertainment', allocated: 5000, spent: 6500, color: 'bg-red-500', over: true },
    { name: 'Subscriptions', allocated: 2000, spent: 1800, color: 'bg-amber-500' },
  ];

  const budgetCategories = budget?.categories || defaultCategories;
  
  // Use Dashboard totals if available, otherwise sum the categories
  const totalAllocated = dashboard?.monthlyBudget || budgetCategories.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = dashboard?.monthlySpent || budgetCategories.reduce((acc, curr) => acc + curr.spent, 0);
  const totalPercentage = Math.min((totalSpent / totalAllocated) * 100, 100).toFixed(1);

  if (budgetLoading && !budget) {
    return <div className="flex-1 p-10 flex items-center justify-center animate-pulse text-gray-500">Compiling Budget Data...</div>;
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Budget Command</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Monitor category thresholds and spending velocity.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
          <Filter className="w-4 h-4 mr-2" /> Current Month
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Total Monthly Budget</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] dark:text-gray-200">₹{totalSpent.toLocaleString('en-IN')}</h2>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-600">/ ₹{totalAllocated.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-[#262626] flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="4" className={totalPercentage > 95 ? "text-red-500" : "text-[#0A3D8B] dark:text-gray-400"} strokeDasharray={`${totalPercentage}, 100`}></circle>
              </svg>
              <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{totalPercentage}%</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] flex items-start gap-4 shadow-sm mt-auto">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-1">Spending Velocity is Optimal</p>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] leading-relaxed">You are currently 4% under your projected spend for this time of the month. Great job managing Leisure expenses.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Spending By Category</h3>
            <PieChart className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-gray-200 mb-6">
            ₹{totalSpent.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#E5E7EB" className="dark:stroke-[#0a0a0a]" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#1E3A8A" className="dark:stroke-gray-400" strokeWidth="4" strokeDasharray="45 55" strokeDashoffset="0"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3B82F6" className="dark:stroke-gray-500" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-45"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#7F1D1D" className="dark:stroke-gray-600" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-70"></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-1">
                <span className="block text-[8px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Total</span>
                <span className="block text-sm font-bold text-[#0F172A] dark:text-gray-200">100%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs w-24">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#1E3A8A] dark:bg-gray-400 mr-2"></div><span className="text-gray-600 dark:text-[#a3a3a3]">Housing</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">45%</span>
              </div>
              <div className="flex items-center justify-between text-xs w-24">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#3B82F6] dark:bg-gray-500 mr-2"></div><span className="text-gray-600 dark:text-[#a3a3a3]">Lifestyle</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">25%</span>
              </div>
              <div className="flex items-center justify-between text-xs w-24">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#7F1D1D] dark:bg-gray-600 mr-2"></div><span className="text-gray-600 dark:text-[#a3a3a3]">Subs</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
         <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Category Envelope Limits</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {budgetCategories.map((cat, idx) => {
          const percent = Math.min((cat.spent / cat.allocated) * 100, 100);
          return (
            <div key={idx} className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{cat.name}</h3>
                </div>
                {cat.over || percent > 95 ? (
                  <span className="flex items-center text-[9px] font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded uppercase tracking-widest"><AlertTriangle className="w-3 h-3 mr-1" /> Over Limit</span>
                ) : (
                  <span className="flex items-center text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> On Track</span>
                )}
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <p className="text-lg font-bold text-[#0F172A] dark:text-gray-200">₹{cat.spent.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-[#a3a3a3]">Limit: ₹{cat.allocated.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="w-full h-2.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${cat.over || percent > 95 ? 'bg-red-500' : cat.color}`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Budget;
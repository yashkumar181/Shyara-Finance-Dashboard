import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PieChart, AlertTriangle, CheckCircle2, TrendingUp, Filter, Plus, Activity, Zap, TrendingDown, Crosshair, X, Trash2, Compass } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const iconMap = { PieChart, Activity, Zap, Crosshair };

const Budget = () => {
  const api = useApi();
  const { budget, setBudget, budgetLoading, setBudgetLoading, transactions, setTransactions } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [insightAvg, setInsightAvg] = useState(null);
  const [newConfig, setNewConfig] = useState({ category_name: '', monthly_limit: '', icon: 'PieChart', allow_rollover: false });

  useEffect(() => {
    const loadData = async () => {
      // ONLY trigger loading screen if we have no cached budget
      if (!useAppStore.getState().budget) {
        setBudgetLoading(true);
      }
      try {
        const [budgetRes, txRes] = await Promise.all([
          api.getBudget(),
          api.getTransactions({ limit: 500 })
        ]);
        setBudget(budgetRes);
        setTransactions(txRes.transactions || txRes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setBudgetLoading(false);
      }
    };
    loadData();
  }, [api, setBudget, setTransactions, setBudgetLoading]);

  const handleCategoryNameChange = (val) => {
    setNewConfig({ ...newConfig, category_name: val });
    if (!val || !transactions.length) return setInsightAvg(null);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const relevantTxns = transactions.filter(t => 
      t.category === val && 
      t.type === 'expense' && 
      new Date(t.transaction_date || t.date) >= ninetyDaysAgo
    );

    const total = relevantTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setInsightAvg(total / 3);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await api.createBudgetCategory({
        category_name: newConfig.category_name,
        monthly_limit: parseFloat(newConfig.monthly_limit),
        icon: newConfig.icon,
        allow_rollover: newConfig.allow_rollover
      });
      // Silent refresh
      const freshBudget = await api.getBudget();
      setBudget(freshBudget);
      setIsAddOpen(false);
      setNewConfig({ category_name: '', monthly_limit: '', icon: 'PieChart', allow_rollover: false });
      setInsightAvg(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteBudgetCategory(id);
      const freshBudget = await api.getBudget();
      setBudget(freshBudget);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSweep = () => {
    alert(`Successfully swept ₹${budget.summary.totalRemaining.toLocaleString()} to Strategic Goals!`);
  };

  // Block the UI only if loading AND data is null
  if (budgetLoading && !budget) {
    return <div className="flex-1 p-10 flex items-center justify-center animate-pulse text-gray-500 uppercase tracking-widest text-sm font-bold">Initializing Fiscal Engine...</div>;
  }

  // Ensure budget exists before accessing
  if (!budget) return null;

  const { summary, categories, daysLeft, daysPassed, daysInMonth } = budget;
  const spendProgress = summary.totalLimit > 0 ? (summary.totalSpent / summary.totalLimit) * 100 : 0;
  const isSurplus = summary.projectedSurplus >= 0;

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Fiscal Pacing</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Monitor category thresholds and predictive burn rates.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-[#262626] text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-[#333] transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> ADD ENVELOPE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Total Allocated Limit</p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl font-bold text-[#0F172A] dark:text-gray-200">₹{summary.totalSpent.toLocaleString('en-IN', {maximumFractionDigits: 0})}</h2>
                <span className="text-sm font-bold text-gray-400 mb-1">/ ₹{summary.totalLimit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-[#262626] flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="4" className={spendProgress > 95 ? "text-red-500" : "text-[#0A3D8B] dark:text-gray-400"} strokeDasharray={`${Math.min(spendProgress, 100)}, 100`}></circle>
              </svg>
              <span className="text-[10px] font-bold text-[#0F172A] dark:text-gray-200">{spendProgress.toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] font-medium">Day {daysPassed} of {daysInMonth}</p>
        </div>

        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-300 uppercase tracking-widest">Daily Safe-to-Spend</p>
            {summary.totalRemaining > 0 && daysLeft <= 5 && (
              <button onClick={handleSweep} className="text-[9px] font-bold bg-[#0A3D8B] text-white px-2 py-1 rounded uppercase tracking-wider">SWEEP</button>
            )}
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#0A3D8B] dark:text-blue-400 mb-1">₹{summary.globalDailySafe.toLocaleString('en-IN', {maximumFractionDigits: 0})}</h2>
            <p className="text-[10px] font-bold text-gray-500 dark:text-blue-300/80 uppercase tracking-widest">Per day for remaining {daysLeft} days</p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${isSurplus ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSurplus ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>End-of-Month Projection</p>
            <Compass className={`w-4 h-4 ${isSurplus ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-1 ${isSurplus ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {isSurplus ? '+' : '-'}₹{Math.abs(summary.projectedSurplus).toLocaleString('en-IN', {maximumFractionDigits: 0})}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSurplus ? 'text-emerald-600/80 dark:text-emerald-500/70' : 'text-red-600/80 dark:text-red-500/70'}`}>
              Projected {isSurplus ? 'Surplus' : 'Deficit'} based on current velocity
            </p>
          </div>
        </div>

      </div>

      <div className="mb-4">
         <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Category Envelopes & Specific Pacing</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || PieChart;
          const isOver = cat.spent > cat.limit;
          const pacingHealthy = cat.dailySafeSpend > 0;

          return (
            <div key={cat.id} className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOver ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-[#262626] text-[#0A3D8B] dark:text-gray-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{cat.name}</h3>
                    <span className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">
                      {isOver ? 'Exceeded Limit' : pacingHealthy ? 'Pacing OK' : 'Warning'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(cat.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
              
              <div className="flex justify-between items-end mb-3">
                <p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{cat.spent.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-[#a3a3a3]">/ ₹{cat.limit.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-[#0A3D8B] dark:bg-blue-500'}`} style={{ width: `${Math.min(cat.percentage, 100)}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-[#262626]">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${pacingHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Safe Daily Spend</span>
                </div>
                <span className={`text-xs font-bold ${pacingHealthy ? 'text-[#0F172A] dark:text-gray-200' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{cat.dailySafeSpend.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </span>
              </div>
            </div>
          )
        })}
        {categories.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-20 border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-2xl text-gray-500">
            No envelopes established. Click "Add Envelope" to begin pacing.
          </div>
        )}
      </div>

      {isAddOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Envelope Configuration</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Define your allocation limit</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-[#0F172A] dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveConfig} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Category Name</label>
                <input required type="text" value={newConfig.category_name} onChange={e => handleCategoryNameChange(e.target.value)} placeholder="e.g. Dining, Transit" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
              </div>

              {insightAvg !== null && insightAvg > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-transparent flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#0A3D8B] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-400 uppercase tracking-widest mb-0.5">Smart Insight</p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Your 90-day average for this category is <span className="font-bold">₹{insightAvg.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>. Consider this when setting limits.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Monthly Limit (₹)</label>
                  <input required type="number" step="1" value={newConfig.monthly_limit} onChange={e => setNewConfig({...newConfig, monthly_limit: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Icon</label>
                  <select value={newConfig.icon} onChange={e => setNewConfig({...newConfig, icon: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]">
                    <option value="PieChart">General</option>
                    <option value="Activity">Health/Activity</option>
                    <option value="Zap">Utility/Fast</option>
                    <option value="Crosshair">Targeted</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center mt-2">
                <input type="checkbox" id="rollover" checked={newConfig.allow_rollover} onChange={e => setNewConfig({...newConfig, allow_rollover: e.target.checked})} className="mr-2 rounded text-[#0A3D8B] focus:ring-[#0A3D8B]" />
                <label htmlFor="rollover" className="text-xs font-bold text-gray-600 dark:text-gray-300">Allow unspent funds to roll over to next month</label>
              </div>

              <button type="submit" className="w-full py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg mt-4">Save Configuration</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Budget;
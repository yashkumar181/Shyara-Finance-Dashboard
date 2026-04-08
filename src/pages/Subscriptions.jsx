import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  TrendingUp, AlertTriangle, History, Download, Plus, PiggyBank, Calendar, Play, Trash2, X
} from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Subscriptions = () => {
  const api = useApi();
  const { subscriptions, setSubscriptions, subscriptionsLoading, setSubscriptionsLoading } = useAppStore();
  
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [newSubData, setNewSubData] = useState({ service_name: '', amount: '', billing_day: '1', category: 'Entertainment' });
  const [isExporting, setIsExporting] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null); // LIVE Modal State

  const loadSubs = async () => {
    if (!useAppStore.getState().subscriptions) {
      setSubscriptionsLoading(true);
    }
    try {
      const data = await api.getSubscriptions('active');
      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  useEffect(() => {
    loadSubs();
  }, [api, setSubscriptions, setSubscriptionsLoading]);

  if (subscriptionsLoading && !subscriptions) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse text-gray-400 dark:text-[#a3a3a3] font-bold tracking-widest uppercase text-sm">
          Syncing Active Services...
        </div>
      </div>
    );
  }

  const activeSubs = subscriptions?.subscriptions || [];
  const monthlyTotal = subscriptions?.summary?.monthlyTotal || 0;
  const yearlyForecast = monthlyTotal * 12;

  const handleExportCSV = () => {
    if (!activeSubs.length) return alert("No active subscriptions to export.");
    setIsExporting(true);
    
    const headers = ["Service Name", "Category", "Amount", "Billing Day", "Status"];
    const rows = activeSubs.map(sub => [
      `"${sub.service_name}"`, 
      `"${sub.category || 'General'}"`, 
      sub.amount, 
      sub.billing_day, 
      sub.status
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `subscriptions_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await api.createSubscription({
        service_name: newSubData.service_name,
        amount: parseFloat(newSubData.amount),
        billing_day: parseInt(newSubData.billing_day),
        category: newSubData.category
      });
      await loadSubs(); 
      setIsAddSubOpen(false);
      setNewSubData({ service_name: '', amount: '', billing_day: '1', category: 'Entertainment' });
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Failed to add service. Please try again.");
    }
  };

  // LIVE Custom Delete Logic
  const confirmDeleteSub = async () => {
    if (!subToDelete) return;
    try {
      await api.deleteSubscription(subToDelete);
      await loadSubs();
      setSubToDelete(null);
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  const categoryTotals = {};
  activeSubs.forEach(sub => {
    const cat = sub.category || 'General';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(sub.amount);
  });
  
  const categoryStats = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    total: categoryTotals[cat],
    percentage: monthlyTotal > 0 ? (categoryTotals[cat] / monthlyTotal) * 100 : 0
  })).sort((a, b) => b.total - a.total).slice(0, 3);

  const averageDailyCost = (yearlyForecast / 365) || 0;
  const potentialSavings = yearlyForecast > 0 ? yearlyForecast * 0.05 : 0;

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-4">Total Monthly Burn</p>
            <h2 className="text-5xl font-bold text-[#0F172A] dark:text-gray-200 mb-3">₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center mb-8">
              <TrendingUp className="w-4 h-4 mr-1" />
              Active Trajectory
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-[#F0F5FF] dark:bg-[#1A2235] px-6 py-4 rounded-xl border border-blue-50 dark:border-blue-900/30 w-40 flex-1 sm:flex-none">
              <p className="text-[9px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Yearly Forecast</p>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">₹{yearlyForecast.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
            </div>
            <div className="bg-[#F0F5FF] dark:bg-[#1A2235] px-6 py-4 rounded-xl border border-blue-50 dark:border-blue-900/30 w-40 flex-1 sm:flex-none">
              <p className="text-[9px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Active Services</p>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">{activeSubs.length}</h4>
            </div>
          </div>
        </div>

        <div className="bg-[#FFEFEA] dark:bg-[#2A1A15] p-8 rounded-2xl shadow-sm border border-orange-50 dark:border-orange-900/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#3A2218] dark:bg-[#4A2511] flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-[#3A2218] dark:text-orange-200 font-bold text-sm">Subscription Audit</h3>
          </div>
          <p className="text-xs text-[#8A4D35] dark:text-orange-300/80 font-medium leading-relaxed mb-6">
            We found <span className="font-bold">2 unused services</span> and <span className="font-bold">1 duplicate charge</span> that could save you <span className="font-bold">₹450.00/mo.</span>
          </p>
          <div className="space-y-3">
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/40 dark:border-white/5">
              <div className="flex items-center text-xs font-bold text-red-800 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 mr-2" /> Duplicate: Hulu
              </div>
              <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-orange-300 tracking-wider uppercase">Resolve</button>
            </div>
            <div className="bg-white/60 dark:bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/40 dark:border-white/5">
              <div className="flex items-center text-xs font-bold text-gray-800 dark:text-gray-300">
                <History className="w-4 h-4 mr-2" /> Rarely Used: Masterclass
              </div>
              <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-orange-300 tracking-wider uppercase">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Active Subscriptions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">A curated view of your recurring fiscal commitments.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleExportCSV} disabled={isExporting} className="flex items-center px-4 py-2 bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-50 dark:hover:bg-[#202A40] transition-colors disabled:opacity-50">
              <Download className="w-4 h-4 mr-2" /> {isExporting ? 'EXPORTING...' : 'EXPORT LEDGER'}
            </button>
            <button onClick={() => setIsAddSubOpen(true)} className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-blue-500 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> ADD SERVICE
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-50 dark:border-white/5 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#121212] border-b border-gray-50 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Service</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Billing Cycle</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Usage Rating</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {activeSubs.map((sub, i) => {
                const colors = [
                  { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
                  { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
                  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
                  { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' }
                ];
                const c = colors[i % colors.length];

                return (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-bold text-sm shrink-0`}>
                        {sub.service_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{sub.service_name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{sub.category || 'Subscription'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider block w-fit mb-1">Monthly</span>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Next: Day {sub.billing_day}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold w-fit bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                        <Play className="w-3 h-3 mr-1.5 fill-current" /> Active
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right flex items-center justify-end h-full mt-2">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mr-4">₹{parseFloat(sub.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                      <button onClick={() => setSubToDelete(sub.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {activeSubs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-sm text-gray-500">No active subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F8FAFC] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">Cost By Category (Live)</p>
          <div className="space-y-4">
            {categoryStats.length > 0 ? categoryStats.map((stat, idx) => {
               const colors = ['bg-[#0A3D8B] dark:bg-blue-500', 'bg-blue-600 dark:bg-gray-400', 'bg-gray-500 dark:bg-gray-600'];
               const barColor = colors[idx % colors.length];
               return (
                 <div key={stat.name} className="flex justify-between items-center text-[10px] font-bold text-[#0F172A] dark:text-gray-300">
                    <div className="w-full h-2 bg-gray-200 dark:bg-[#121212] rounded-full overflow-hidden mr-4">
                       <div className={`h-full ${barColor} rounded-full`} style={{ width: `${stat.percentage}%` }}></div>
                    </div>
                    <span className="truncate w-24 text-right">{stat.name}</span>
                 </div>
               )
            }) : (
              <p className="text-xs text-gray-500">Add subscriptions to see breakdown.</p>
            )}
          </div>
        </div>

        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
          <PiggyBank className="w-6 h-6 text-[#0A3D8B] dark:text-blue-400 mb-3" />
          <p className="text-[10px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Target Savings (5%)</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{potentialSavings.toLocaleString('en-IN', {minimumFractionDigits: 0})}/yr</h3>
        </div>

        <div className="bg-[#F8FAFC] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <Calendar className="w-6 h-6 text-[#0A3D8B] dark:text-gray-400 mb-3" />
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Average Daily Cost</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{averageDailyCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
        </div>
      </div>

      {isAddSubOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddSubOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Subscription</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Track a recurring charge</p>
              </div>
              <button onClick={() => setIsAddSubOpen(false)} className="text-gray-400 hover:text-[#0F172A] dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Service Name</label>
                <input required type="text" value={newSubData.service_name} onChange={e => setNewSubData({...newSubData, service_name: e.target.value})} placeholder="e.g. Netflix, Spotify" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Monthly Cost (₹)</label>
                  <input required type="number" step="0.01" value={newSubData.amount} onChange={e => setNewSubData({...newSubData, amount: e.target.value})} placeholder="199.00" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Billing Day (1-31)</label>
                  <input required type="number" min="1" max="31" value={newSubData.billing_day} onChange={e => setNewSubData({...newSubData, billing_day: e.target.value})} placeholder="15" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Category</label>
                <select value={newSubData.category} onChange={e => setNewSubData({...newSubData, category: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500">
                  <option value="Entertainment">Entertainment</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Software">Software</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg mt-4">Save Subscription</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRMATION MODAL */}
      {subToDelete && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSubToDelete(null)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">Cancel Service?</h2>
            <p className="text-sm text-gray-500 dark:text-[#a3a3a3] mb-6">Are you sure you want to cancel and track this subscription as deleted? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setSubToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#333] text-[#0F172A] dark:text-gray-200 rounded-xl text-sm font-bold transition-colors border border-gray-200 dark:border-transparent">Cancel</button>
              <button onClick={confirmDeleteSub} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Subscriptions;
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  TrendingUp, Wallet, Activity, PieChart, Building2, 
  Plus, RefreshCw, X, Trash2, AlertTriangle, BrainCircuit, TrendingDown, Coins, ArrowRight
} from 'lucide-react';
import AreaChart from '../components/charts/AreaChart';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Investments = () => {
  const api = useApi();
  // Added setInsights here so we can save the data!
  const { investments, setInvestments, investmentsLoading, setInvestmentsLoading, setDashboard, insights, setInsights } = useAppStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  
  const [newAsset, setNewAsset] = useState({ name: '', ticker_symbol: '', asset_type: 'stock', quantity: '', average_buy_price: '' });

  // Upgraded loader to fetch both Investments and AI Insights in parallel
  const loadInvestments = async () => {
    if (!useAppStore.getState().investments) setInvestmentsLoading(true);
    try {
      const [invData, insData] = await Promise.all([
        api.getInvestments(),
        api.getInsights().catch(() => null) // Catch error so it doesn't break investments
      ]);
      setInvestments(Array.isArray(invData) ? invData : []);
      if (insData) setInsights(insData);
    } catch (err) {
      setInvestments([]);
    } finally {
      setInvestmentsLoading(false);
    }
  };

  useEffect(() => { loadInvestments(); }, [api, setInvestments, setInvestmentsLoading, setInsights]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const updatedData = await api.syncInvestments();
      if (updatedData && updatedData.error) {
         alert("Market Sync Failed: " + updatedData.error);
      } else {
         setInvestments(Array.isArray(updatedData) ? updatedData : []);
         // Also refresh dashboard and insights after sync
         const [freshDashboard, freshInsights] = await Promise.all([
           api.getDashboard().catch(() => null),
           api.getInsights().catch(() => null)
         ]);
         if (freshDashboard) setDashboard(freshDashboard);
         if (freshInsights) setInsights(freshInsights);
      }
    } catch (err) {
      alert("Network error: Failed to reach market data servers.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const added = await api.createInvestment(newAsset);
      setInvestments([added, ...(investments || [])]);
      setIsAddOpen(false);
      setNewAsset({ name: '', ticker_symbol: '', asset_type: 'stock', quantity: '', average_buy_price: '' });
      const freshDashboard = await api.getDashboard();
      if (freshDashboard) setDashboard(freshDashboard);
      
      // Refresh insights to include new asset
      const freshInsights = await api.getInsights();
      if (freshInsights) setInsights(freshInsights);
    } catch (err) { alert("Failed to add asset."); }
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await api.deleteInvestment(assetToDelete);
      setInvestments((investments || []).filter(a => a.id !== assetToDelete));
      setAssetToDelete(null);
      const freshDashboard = await api.getDashboard();
      if (freshDashboard) setDashboard(freshDashboard);
      
      // Refresh insights to reflect deleted asset
      const freshInsights = await api.getInsights();
      if (freshInsights) setInsights(freshInsights);
    } catch (err) {}
  };

  if (investmentsLoading && !investments) {
    return <div className="flex-1 p-10 flex items-center justify-center animate-pulse text-gray-400 dark:text-[#a3a3a3] font-bold tracking-widest uppercase text-sm">Syncing Portfolio...</div>;
  }

  const safeAssets = Array.isArray(investments) ? investments : [];
  const totalInvested = safeAssets.reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.average_buy_price)), 0);
  const currentValue = safeAssets.reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.current_price)), 0);
  const totalGain = currentValue - totalInvested;
  const totalRoi = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const stockValue = safeAssets.filter(a => a.asset_type === 'stock').reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.current_price)), 0);
  const mfValue = safeAssets.filter(a => a.asset_type === 'mf').reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.current_price)), 0);
  const cryptoValue = safeAssets.filter(a => a.asset_type === 'crypto').reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.current_price)), 0);

  const stockPct = currentValue > 0 ? (stockValue / currentValue) * 100 : 0;
  const mfPct = currentValue > 0 ? (mfValue / currentValue) * 100 : 0;
  const cryptoPct = currentValue > 0 ? (cryptoValue / currentValue) * 100 : 0;

  const chartData = [
    { label: 'Jan', income: totalInvested * 0.8, expense: totalInvested * 0.82 },
    { label: 'Feb', income: totalInvested * 0.9, expense: totalInvested * 0.95 },
    { label: 'Mar', income: totalInvested * 0.95, expense: totalInvested * 0.98 },
    { label: 'Apr', income: totalInvested, expense: currentValue }
  ];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 pb-28 md:pb-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Investment Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Tracking across {safeAssets.length} active assets</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-[#F8F9FA] dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </button>
          <button onClick={handleSync} disabled={isSyncing} className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-gray-700 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-70">
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Market...' : 'Sync Market Prices'}
          </button>
        </div>
      </div>

      {/* PORTFOLIO INTELLIGENCE SECTION */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <BrainCircuit className="w-4 h-4 text-[#0A3D8B] dark:text-blue-400" />
          <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 tracking-tight uppercase">Portfolio Intelligence</h2>
        </div>

        {!insights ? (
          <div className="p-6 bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#262626] flex items-center space-x-4 animate-pulse">
            <BrainCircuit className="w-6 h-6 text-[#0A3D8B] dark:text-blue-500" />
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Analyzing Portfolio...</h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Crunching live market data for insights.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.taxLossOpportunities?.length > 0 ? (
              <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626]">
                <TrendingDown className="w-5 h-5 text-[#0A3D8B] dark:text-blue-400 mb-3" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Tax Loss Harvesting</h4>
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed mb-3">Sell {insights.taxLossOpportunities[0].name} to harvest ₹{insights.taxLossOpportunities[0].harvestable_loss.toLocaleString('en-IN')} in losses.</p>
                <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-gray-400 uppercase tracking-widest flex items-center hover:underline">Review Strategy <ArrowRight className="w-3 h-3 ml-1" /></button>
              </div>
            ) : (
              <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626] opacity-60">
                <TrendingDown className="w-5 h-5 text-gray-400 mb-3" />
                <h4 className="text-sm font-bold text-gray-500 mb-1">No Tax Losses</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Your portfolio is too profitable to harvest tax losses.</p>
              </div>
            )}

            <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626]">
              <Coins className="w-5 h-5 text-yellow-500 mb-3" />
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Dividend Snowball</h4>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Pacing to generate <span className="font-bold text-[#0F172A] dark:text-gray-200">₹{insights.annualDividends?.toLocaleString('en-IN') || '0'}</span> in passive income this year.</p>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626]">
              <Activity className="w-5 h-5 text-purple-500 mb-3" />
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Portfolio Beta</h4>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Risk score is <span className={`font-bold ${parseFloat(insights.portfolioBeta) > 1.2 ? 'text-red-500' : 'text-emerald-500'}`}>{insights.portfolioBeta || '1.0'}</span>. {parseFloat(insights.portfolioBeta) > 1.2 ? 'High volatility detected.' : 'Market stable.'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-md text-white relative overflow-hidden flex flex-col justify-between h-40 border border-transparent dark:border-[#262626]">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
            <Wallet className="w-48 h-48" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-blue-200 tracking-widest uppercase mb-1">Current Value</p>
            <h3 className="text-3xl lg:text-4xl font-bold mb-3 dark:text-gray-100">₹{currentValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              <span className="text-[10px] text-blue-200">Total Unrealized</span>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Total Invested</p>
            <h3 className="text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-gray-200">₹{totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Cash Basis</p>
            <Wallet className="w-5 h-5 text-[#0A3D8B] dark:text-gray-400" />
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Absolute ROI</p>
            <h3 className={`text-2xl lg:text-3xl font-bold ${totalRoi >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>{totalRoi.toFixed(2)}%</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Portfolio Yield</p>
            <Activity className={`w-5 h-5 ${totalRoi >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Holdings Performance</h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">P&L trajectory against initial capital</p>
            </div>
            <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-400 mr-2"></div>INVESTED</div>
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>CURRENT</div>
            </div>
          </div>
          <AreaChart data={chartData} />
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Asset Allocation</h2>
            <PieChart className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${stockPct} ${100 - stockPct}`} strokeDashoffset="0"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray={`${mfPct} ${100 - mfPct}`} strokeDashoffset={`-${stockPct}`}></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${cryptoPct} ${100 - cryptoPct}`} strokeDashoffset={`-${stockPct + mfPct}`}></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-1">
                <span className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Total</span>
                <span className="block text-xl font-bold text-[#0F172A] dark:text-gray-200">{safeAssets.length} Assets</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Stocks & ETFs</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">{stockPct.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-violet-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Mutual Funds</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">{mfPct.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Crypto / Other</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">{cryptoPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-[#262626] gap-4">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Active Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626] bg-gray-100 dark:bg-[#0a0a0a]">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Asset & Ticker</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Quantity</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Avg Price</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Current Price</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Total Value</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">P&L</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {safeAssets.map((item) => {
                const qty = parseFloat(item.quantity);
                const avgPrice = parseFloat(item.average_buy_price);
                const curPrice = parseFloat(item.current_price);
                
                const invested = qty * avgPrice;
                const value = qty * curPrice;
                const pl = value - invested;
                const plPct = invested > 0 ? (pl / invested) * 100 : 0;
                
                const isPositive = pl >= 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-5 flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#262626] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{item.name}</p>
                        <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold tracking-widest uppercase mt-0.5">{item.ticker_symbol}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{qty.toFixed(4)}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-gray-500 dark:text-[#a3a3a3]">₹{avgPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹{curPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-[#0A3D8B] dark:text-blue-400">₹{value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? '+' : ''}₹{pl.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </p>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isPositive ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-red-600/70 dark:text-red-500/70'}`}>
                        {plPct.toFixed(2)}%
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => setAssetToDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {safeAssets.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-sm text-gray-500">No assets tracked. Add your first investment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Track New Asset</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Add to portfolio</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-[#0F172A] dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddAsset} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Asset Name</label>
                <input required type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="e.g. Reliance Industries" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Ticker / MF Code</label>
                  <input required type="text" value={newAsset.ticker_symbol} onChange={e => setNewAsset({...newAsset, ticker_symbol: e.target.value})} placeholder="RELIANCE.NS or 119062" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Asset Type</label>
                  <select value={newAsset.asset_type} onChange={e => setNewAsset({...newAsset, asset_type: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]">
                    <option value="stock">Stock / ETF</option>
                    <option value="mf">Mutual Fund</option>
                    <option value="crypto">Crypto / Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Quantity Owned</label>
                  <input required type="number" step="0.0001" value={newAsset.quantity} onChange={e => setNewAsset({...newAsset, quantity: e.target.value})} placeholder="10.5" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Avg Buy Price (₹)</label>
                  <input required type="number" step="0.01" value={newAsset.average_buy_price} onChange={e => setNewAsset({...newAsset, average_buy_price: e.target.value})} placeholder="2500.00" className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#0A3D8B] dark:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-lg mt-4">Add Asset</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* CUSTOM DELETE MODAL */}
      {assetToDelete && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAssetToDelete(null)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">Untrack Asset?</h2>
            <p className="text-sm text-gray-500 dark:text-[#a3a3a3] mb-6">Are you sure you want to remove this asset? This does not sell the asset.</p>
            <div className="flex space-x-3">
              <button onClick={() => setAssetToDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#333] text-[#0F172A] dark:text-gray-200 rounded-xl text-sm font-bold transition-colors border border-gray-200 dark:border-transparent">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg">Untrack</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Investments;
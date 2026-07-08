import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, Wallet, PieChart, Trash2,
  Building, Landmark, Shield, Bell, Calendar, Coins, ArrowUpRight, 
  ArrowDownRight, CircleDollarSign, Gem, Activity, Search, Filter, X, AlertTriangle, RefreshCw
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { calculateRealTimeValue } from '../utils/valuation';

// --- SUB-COMPONENTS FOR DYNAMIC VALUATION CARDS ---

const RealEstateCard = ({ property, onClick }) => {
  const pricePerSqFt = Number(property.avgPrice || property.price || 0);
  const area = Number(property.quantity || 0);
  const totalPrincipal = pricePerSqFt * area;
  
  const growthRate = Number(property.metadata?.growth_rate || 0);
  const buyDate = property.metadata?.purchase_date || new Date().toISOString().split('T')[0];
  
  const { currentValue, profit, roiPercentage, yearsElapsed } = calculateRealTimeValue(totalPrincipal, growthRate, buyDate, 'annual');

  return (
    <div onClick={onClick} className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm hover:border-[#0A3D8B] dark:hover:border-blue-500 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
            {property.asset_type || 'Property'} • {area.toLocaleString('en-IN')} SQ FT
          </span>
          <h3 className="text-lg font-bold mt-2 text-[#0F172A] dark:text-gray-200 group-hover:text-[#0A3D8B] dark:group-hover:text-blue-400 transition-colors">{property.name}</h3>
          <p className="text-xs text-gray-500">{property.metadata?.location || 'India'} • Bought {buyDate}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
            +{growthRate}% / yr
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl my-4 border border-gray-100 dark:border-[#262626]">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Buy Price</p>
          <p className="text-base font-bold text-[#0F172A] dark:text-gray-300">₹{totalPrincipal.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">@ ₹{pricePerSqFt.toLocaleString('en-IN')} / sq ft</p>
        </div>
        <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
          <p className="text-[11px] font-bold text-[#0A3D8B] dark:text-blue-500 uppercase tracking-wider">Current Value</p>
          <p className="text-lg font-extrabold text-[#0A3D8B] dark:text-blue-400">₹{currentValue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-0.5">+{roiPercentage}% ROI</p>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-[#262626] text-xs font-semibold">
        <span className="text-gray-500">Unrealized Gain</span>
        <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">+{profit.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

const FixedIncomeCard = ({ fd, onClick }) => {
  const principal = Number(fd.avgPrice || fd.price || 0);
  const rate = Number(fd.metadata?.interest_rate || 0);
  const depositDate = fd.metadata?.purchase_date || new Date().toISOString().split('T')[0];
  
  const { currentValue, profit } = calculateRealTimeValue(principal, rate, depositDate, 'quarterly');

  return (
    <div onClick={onClick} className="relative flex justify-between items-center border-b border-dashed border-gray-100 dark:border-[#262626] pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] p-2 rounded-lg cursor-pointer transition-colors">
      <div>
        <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{fd.name}</h4>
        <div className="flex gap-2 items-center mt-1">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">{rate}% Yield</span>
          <span className="text-[10px] text-gray-400">Mat: {fd.metadata?.maturity_date || 'N/A'}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-[#0A3D8B] dark:text-blue-400">₹{currentValue.toLocaleString('en-IN')}</p>
        <p className="text-[10px] text-emerald-500 font-bold">Earned: +₹{profit.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Investments = () => {
  const api = useApi();
  const { investments, setInvestments } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

  const [formData, setFormData] = useState({
    action: 'Buy', asset_class: 'market', asset_type: 'Stock', symbol: '', name: '', quantity: '', price: '', 
    date: new Date().toISOString().split('T')[0], location: '', interest_rate: '', growth_rate: '', 
    purchase_date: '', maturity_date: '', coverage: ''
  });

  const fetchInvestments = async () => {
    try {
      const data = await api.getInvestments();
      if (data) setInvestments(data);
    } catch (error) { console.error("Failed to fetch investments", error); }
  };

  useEffect(() => { fetchInvestments(); }, [api]);

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const rawMarketAssets = safeInvestments.filter(i => i.asset_class === 'market');
  const commodities = safeInvestments.filter(i => i.asset_class === 'commodity');
  const realEstate = safeInvestments.filter(i => i.asset_class === 'real_estate');
  const fixedIncome = safeInvestments.filter(i => i.asset_class === 'fixed_income');
  const insurance = safeInvestments.filter(i => i.asset_class === 'insurance');

  const marketAssets = rawMarketAssets.map(asset => {
    const pnl = (asset.currentPrice - asset.avgPrice) * asset.quantity;
    const pnlPct = asset.avgPrice > 0 ? ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100 : 0;
    return { ...asset, pnl, pnlPct: pnlPct.toFixed(2) };
  });

  const filteredMarketAssets = marketAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || (asset.symbol && asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (typeFilter === 'All' || asset.type === typeFilter);
  });

  // Calculate Balances
  const totalValue = safeInvestments.reduce((sum, inv) => {
    if (inv.asset_class === 'real_estate') {
      return sum + calculateRealTimeValue(inv.avgPrice * inv.quantity, inv.metadata?.growth_rate, inv.metadata?.purchase_date, 'annual').currentValue;
    }
    if (inv.asset_class === 'fixed_income') {
      return sum + calculateRealTimeValue(inv.avgPrice, inv.metadata?.interest_rate, inv.metadata?.purchase_date, 'quarterly').currentValue;
    }
    return sum + (inv.currentPrice * inv.quantity);
  }, 0);
  
  const totalInvested = safeInvestments.reduce((sum, inv) => {
    if (inv.asset_class === 'real_estate') return sum + (inv.avgPrice * inv.quantity);
    return sum + (inv.avgPrice * inv.quantity);
  }, 0);
  
  const overallReturn = totalValue - totalInvested;
  const overallReturnPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  // --- DAILY CHANGE CALCULATIONS ---
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const marketDailyChange = safeInvestments
    .filter(i => i.asset_class === 'market' || i.asset_class === 'commodity')
    .reduce((sum, asset) => {
      const prevClose = asset.metadata?.previousClose || asset.currentPrice; 
      return sum + ((asset.currentPrice - prevClose) * asset.quantity);
    }, 0);

  const algorithmicDailyChange = safeInvestments
    .filter(i => i.asset_class === 'real_estate' || i.asset_class === 'fixed_income')
    .reduce((sum, asset) => {
      const type = asset.asset_class === 'real_estate' ? 'annual' : 'quarterly';
      const p = asset.asset_class === 'real_estate' ? (asset.avgPrice * asset.quantity) : asset.avgPrice;
      const rate = asset.asset_class === 'real_estate' ? asset.metadata?.growth_rate : asset.metadata?.interest_rate;
      
      const valToday = calculateRealTimeValue(p, rate, asset.metadata?.purchase_date, type, new Date()).currentValue;
      const valYesterday = calculateRealTimeValue(p, rate, asset.metadata?.purchase_date, type, yesterday).currentValue;
      
      return sum + (valToday - valYesterday);
    }, 0);

  const globalDailyChange = marketDailyChange + algorithmicDailyChange;
  
  const marketOnlyDailyChange = safeInvestments
    .filter(i => i.asset_class === 'market')
    .reduce((sum, asset) => {
      const prevClose = asset.metadata?.previousClose || asset.currentPrice; 
      return sum + ((asset.currentPrice - prevClose) * asset.quantity);
    }, 0);

  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const realizedPnL12Months = safeInvestments.reduce((totalPnL, asset) => totalPnL + (asset.history || []).filter(tx => tx.action === 'Sell' && new Date(tx.date) >= twelveMonthsAgo).reduce((sum, tx) => sum + (tx.pnl || 0), 0), 0);

  const marketAlerts = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  marketAssets.forEach(asset => {
    const meta = asset.metadata || {};
    if (meta.exDividendDate) {
      const exDate = new Date(meta.exDividendDate); exDate.setHours(0, 0, 0, 0);
      if (exDate >= today) marketAlerts.push({ id: `div-${asset.id}`, type: 'dividend', title: `${asset.symbol} Ex-Dividend`, date: exDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), value: meta.dividendRate ? `₹${meta.dividendRate} / share` : 'Upcoming', timestamp: exDate.getTime() });
    }
    if (meta.earningsDate) {
      const earnDate = new Date(meta.earningsDate); earnDate.setHours(0, 0, 0, 0);
      if (earnDate >= today) marketAlerts.push({ id: `earn-${asset.id}`, type: 'earnings', title: `${asset.symbol} Earnings`, date: earnDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), value: 'Expected', timestamp: earnDate.getTime() });
    }
  });
  marketAlerts.sort((a, b) => a.timestamp - b.timestamp);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.syncInvestments(); 
      await fetchInvestments(); 
    } catch (err) { console.error("Sync error:", err); }
    setIsSyncing(false);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let payload = { ...formData };
      let metadata = {};

      if (payload.asset_class === 'real_estate') {
        metadata = { location: payload.location, growth_rate: payload.growth_rate, purchase_date: payload.purchase_date };
      } else if (payload.asset_class === 'fixed_income') {
        payload.quantity = 1;
        metadata = { interest_rate: payload.interest_rate, purchase_date: payload.purchase_date, maturity_date: payload.maturity_date };
      } else if (payload.asset_class === 'insurance') {
        payload.quantity = 1;
        metadata = { coverage: payload.coverage };
      }

      payload.metadata = metadata;
      await api.createInvestment(payload);
      await fetchInvestments();
      setIsAddModalOpen(false);
      setFormData({ action: 'Buy', asset_class: 'market', asset_type: 'Stock', symbol: '', name: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0], location: '', interest_rate: '', growth_rate: '', purchase_date: '', maturity_date: '', coverage: '' });
    } catch (error) { alert(error.response?.data?.error || "Failed to submit execution details."); } 
    finally { setIsSubmitting(false); }
  };

  const executeDelete = async () => {
    try {
      if (confirmDelete.type === 'asset') await api.deleteInvestment(confirmDelete.id);
      else if (confirmDelete.type === 'transaction') await api.deleteInvestmentTransaction(confirmDelete.id);
      setSelectedAssetHistory(null);
      await fetchInvestments();
    } catch (err) { console.error("Deletion failure", err); } 
    finally { setConfirmDelete({ isOpen: false, type: '', id: null, title: '', message: '' }); }
  };

  const triggerDeleteAsset = (id, name) => setConfirmDelete({ isOpen: true, type: 'asset', id, title: 'Wipe Asset Position?', message: `Delete ${name || 'asset'} completely?` });
  const triggerDeleteTransaction = (id) => setConfirmDelete({ isOpen: true, type: 'transaction', id, title: 'Delete Execution Record?', message: 'Delete this execution record?' });

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center px-5 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === id ? 'bg-[#0A3D8B] dark:bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626]'}`}>
      <Icon className="w-4 h-4 mr-2" />{label}
    </button>
  );

  return (
    <div className="flex-1 overflow-auto p-4 pb-28 md:p-10 md:pb-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Wealth Portfolio</h1><p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Track and manage your multi-asset investments.</p></div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={handleSync} disabled={isSyncing} className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Live Market Sync'}</button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-5 py-2.5 bg-[#0F172A] dark:bg-gray-200 text-white dark:text-[#0F172A] rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"><Plus className="w-4 h-4 mr-2" /> Add Asset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#262626] text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Wallet className="w-32 h-32" /></div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-blue-200 mb-2">Total Net Portfolio</p>
          <h2 className="text-3xl font-bold mb-1">₹{totalValue.toLocaleString('en-IN')}</h2>
          <p className="text-sm text-blue-200">Across all asset classes</p>
        </div>
        
        {/* NEW Global Daily Change */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Today's Global Change</p>
          <div className="flex items-end space-x-2">
            <h2 className={`text-2xl font-bold ${globalDailyChange >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
              {globalDailyChange >= 0 ? '+' : ''}₹{globalDailyChange.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">24h delta across all asset classes</p>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Overall Unrealized ROI</p>
          <h2 className={`text-2xl font-bold ${overallReturn >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>{overallReturn >= 0 ? '+' : ''}₹{overallReturn.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
          <div className={`inline-flex items-center mt-2 px-2 py-1 rounded bg-opacity-20 text-xs font-bold ${overallReturn >= 0 ? 'bg-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-red-500 text-red-600 dark:text-red-400'}`}>{overallReturn >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}{overallReturnPct.toFixed(2)}% Total Yield</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <TabButton id="market" label="Markets & Crypto" icon={Activity} />
        <TabButton id="commodities" label="Commodities" icon={Gem} />
        <TabButton id="real_estate" label="Real Estate" icon={Building} />
        <TabButton id="fixed_income" label="Fixed Income & Safety" icon={Shield} />
      </div>

      {activeTab === 'market' && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2"><PieChart className="w-5 h-5 text-gray-400" /><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Active Holdings</h3></div>
              <div className="flex w-full sm:w-auto items-center space-x-3">
                <div className="relative flex-1 sm:w-48"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search asset..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm text-[#0F172A] dark:text-gray-200 rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-blue-500" /></div>
                <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-bold text-[#0F172A] dark:text-gray-200 rounded-lg focus:outline-none appearance-none cursor-pointer"><option value="All">All Types</option><option value="Stock">Stock</option><option value="ETF">ETF</option><option value="Crypto">Crypto</option><option value="Mutual Fund">Mutual Fund</option></select></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#0a0a0a] text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-[#262626]"><th className="p-4">Asset</th><th className="p-4">Type</th><th className="p-4 text-right">Avg Price</th><th className="p-4 text-right">LTP</th><th className="p-4 text-right">Unrealized P&L</th></tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMarketAssets.length > 0 ? (filteredMarketAssets.map(asset => (
                    <tr key={asset.id} onClick={() => setSelectedAssetHistory(asset)} className="border-b border-gray-100 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                      <td className="p-4"><p className="font-bold text-[#0F172A] dark:text-gray-200 group-hover:text-[#0A3D8B] dark:group-hover:text-blue-400 transition-colors">{asset.symbol || asset.name}</p><p className="text-xs text-gray-500">{asset.name} ({asset.quantity} shares)</p></td>
                      <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-gray-300 rounded text-xs font-bold">{asset.type}</span></td>
                      <td className="p-4 text-right font-semibold">₹{asset.avgPrice.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right font-bold text-[#0F172A] dark:text-gray-200">₹{asset.currentPrice.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right"><p className={`font-bold ${asset.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>{asset.pnl >= 0 ? '+' : ''}₹{asset.pnl.toLocaleString('en-IN')}</p><p className={`text-xs font-bold flex items-center justify-end mt-0.5 ${asset.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>{asset.pnl >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}{asset.pnlPct}%</p></td>
                    </tr>
                  ))) : (<tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No assets found matching parameters.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full xl:w-96 flex flex-col gap-6">
            
            {/* NEW: Today's Market P&L */}
            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className={`w-4 h-4 ${marketOnlyDailyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Today's Market P&L</p>
              </div>
              <h3 className={`text-2xl font-bold ${marketOnlyDailyChange >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                {marketOnlyDailyChange >= 0 ? '+' : ''}₹{marketOnlyDailyChange.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-xs text-gray-400 mt-1">00:00 AM to 11:59 PM (Equities & Crypto)</p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
              <div className="flex items-center space-x-2 mb-3"><CircleDollarSign className="w-4 h-4 text-emerald-500" /><p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Realized P&L (12 Months)</p></div>
              <h3 className={`text-2xl font-bold ${realizedPnL12Months >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>{realizedPnL12Months >= 0 ? '+' : ''}₹{realizedPnL12Months.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-gray-400 mt-1">Booked cash returns locked from asset sales.</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-[#1a1a2e] dark:to-[#16213e] p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center space-x-2 mb-6"><Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /><h3 className="text-sm font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Market Intelligence</h3></div>
              <div className="space-y-4">
                {marketAlerts.length > 0 ? (marketAlerts.map(alert => (
                  <div key={alert.id} className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm p-4 rounded-xl border border-white dark:border-[#262626] shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">{alert.type === 'dividend' ? <CircleDollarSign className="w-4 h-4 text-emerald-500" /> : <Calendar className="w-4 h-4 text-orange-500" />}<span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{alert.title}</span></div>
                    </div>
                    <div className="flex justify-between items-end"><p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{alert.date}</p><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{alert.value}</p></div>
                  </div>
                ))) : (<p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed text-center py-4">No upcoming corporate actions or dividends detected for your portfolio.</p>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commodities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {commodities.map(item => {
             const totalVal = item.currentPrice * item.quantity;
             const pnl = (item.currentPrice - item.avgPrice) * item.quantity;
             const pnlPct = item.avgPrice > 0 ? ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100 : 0;
             return (
              <div key={item.id} onClick={() => setSelectedAssetHistory(item)} className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] group hover:-translate-y-1 hover:border-[#0A3D8B] dark:hover:border-blue-500 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.type.toLowerCase().includes('gold') ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}><Coins className="w-6 h-6" /></div>
                    <div><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 group-hover:text-[#0A3D8B] dark:group-hover:text-blue-400 transition-colors">{item.type}</h3><p className="text-xs text-gray-500 font-bold">{item.quantity} Grams • {item.name}</p></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#262626] pb-3"><span className="text-xs text-gray-500">Avg Buy Price</span><span className="text-sm font-bold text-[#0F172A] dark:text-gray-300">₹{item.avgPrice.toLocaleString('en-IN')} / g</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#262626] pb-3"><span className="text-xs text-gray-500">Current Market</span><span className="text-sm font-bold text-[#0F172A] dark:text-gray-300">₹{item.currentPrice.toLocaleString('en-IN')} / g</span></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Value</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0A3D8B] dark:text-blue-400">₹{totalVal.toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-bold flex items-center justify-end ${pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')} ({pnlPct.toFixed(2)}%)</p>
                    </div>
                  </div>
                </div>
              </div>
          )})}
        </div>
      )}

      {activeTab === 'real_estate' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realEstate.map(property => (
            <RealEstateCard key={property.id} property={property} onClick={() => setSelectedAssetHistory(property)} />
          ))}
        </div>
      )}

      {activeTab === 'fixed_income' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
             <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-[#262626] pb-4">
              <div className="flex items-center space-x-2"><Landmark className="w-5 h-5 text-indigo-600" /><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Fixed Income Ledger</h3></div>
            </div>
            <div className="space-y-2">
              {fixedIncome.map(fd => <FixedIncomeCard key={fd.id} fd={fd} onClick={() => setSelectedAssetHistory(fd)} />)}
            </div>
          </div>
          <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-[#262626] pb-4">
              <div className="flex items-center space-x-2"><Shield className="w-5 h-5 text-emerald-600" /><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Policies Assured</h3></div>
            </div>
            <div className="space-y-4">
              {insurance.map(ins => (
                <div key={ins.id} onClick={() => setSelectedAssetHistory(ins)} className="flex justify-between items-center border-b border-dashed border-gray-100 dark:border-[#262626] pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] p-2 rounded">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{ins.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cover Shield: ₹{Number(ins.metadata?.coverage || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-bold text-emerald-600">₹{ins.avgPrice.toLocaleString('en-IN')} <span className="text-[9px] text-gray-400 font-normal">/yr</span></p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RECORD ASSET TRANSACTION --- */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a] rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Record Asset Transaction</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            
            <form id="asset-form" onSubmit={handleAddAsset} className="p-6 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Buy', 'Sell'].map(act => (
                    <div key={act} onClick={() => setFormData({...formData, action: act})} className={`cursor-pointer py-3 rounded-xl text-xs font-bold text-center border transition-all ${formData.action === act ? 'bg-[#0A3D8B] text-white border-transparent' : 'bg-gray-50 dark:bg-[#0a0a0a] border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400'}`}>
                      {act === 'Buy' ? '🟢 Buy / Add Asset' : '🔴 Sell / Reduce Asset'}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Asset Class</label>
                <select required value={formData.asset_class} onChange={(e) => setFormData({...formData, asset_class: e.target.value, asset_type: e.target.value === 'real_estate' ? 'Plot' : e.target.value === 'fixed_income' ? 'Fixed Deposit' : e.target.value === 'insurance' ? 'Term Life' : e.target.value === 'commodity' ? 'Gold' : 'Stock'})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] cursor-pointer">
                  <option value="market">Market (Stock / ETF / Crypto)</option>
                  <option value="commodity">Commodity (Physical Gold / Silver)</option>
                  <option value="real_estate">Real Estate (Land / Property)</option>
                  <option value="fixed_income">Fixed Income (FD / Bonds)</option>
                  <option value="insurance">Insurance Policy</option>
                </select>
              </div>

              {/* MARKET FORM */}
              {formData.asset_class === 'market' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Asset Name</label>
                      <input required type="text" placeholder="e.g. Delhivery" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Symbol / Ticker</label>
                      <input type="text" placeholder="e.g. DELHIVERY" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Type</label>
                      <input required type="text" placeholder="Stock, ETF..." value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Qty (Units)</label>
                      <input required type="number" step="0.00001" placeholder="Units" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Avg Price (₹)</label>
                      <input required type="number" step="0.01" placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                  </div>
                </>
              )}

              {/* COMMODITY FORM */}
              {formData.asset_class === 'commodity' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Asset Name</label>
                      <input required type="text" placeholder="e.g. Gold Coins" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Metal Type</label>
                      <select required value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl cursor-pointer focus:outline-none focus:border-[#0A3D8B]">
                        <option value="Gold">Gold</option><option value="Silver">Silver</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Weight (Grams)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 50" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Purchase Price per Gram (₹)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 7100" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                    </div>
                  </div>
                </>
              )}

              {/* REAL ESTATE FORM */}
              {formData.asset_class === 'real_estate' && (
                <div className="space-y-4 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-[#262626]">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Estate Valuation Parameters</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Property Name</label>
                      <input required type="text" placeholder="e.g. Greenfield Plot" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Property Type</label>
                      <select required value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none cursor-pointer">
                        <option value="Plot">Plot / Land</option><option value="Apartment">Apartment</option><option value="Commercial">Commercial Space</option><option value="House">Independent House</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Total Area (sq ft)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 1500" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Purchase Price per sq ft (₹)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 3500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Expected Yearly Appr. (%)</label>
                      <input required type="number" step="0.1" placeholder="e.g. 10" value={formData.growth_rate} onChange={(e) => setFormData({...formData, growth_rate: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Purchase Date</label>
                      <input required type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Location / City</label>
                    <input required type="text" placeholder="e.g. Indore" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              )}

              {/* FIXED INCOME FORM */}
              {formData.asset_class === 'fixed_income' && (
                <div className="space-y-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Fixed Deposit / Bond Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Institution Name</label>
                      <input required type="text" placeholder="e.g. HDFC Bank" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Instrument Type</label>
                      <select required value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none cursor-pointer">
                        <option value="Fixed Deposit">Fixed Deposit (FD)</option><option value="Sovereign Gold Bond">SGB / Gold Bond</option><option value="Corporate Bond">Corporate Bond</option><option value="PPF">PPF</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Principal Amount (₹)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 500000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Annual Interest Rate (%)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 7.1" value={formData.interest_rate} onChange={(e) => setFormData({...formData, interest_rate: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Deposit Date</label>
                      <input required type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Maturity Date</label>
                      <input required type="date" value={formData.maturity_date} onChange={(e) => setFormData({...formData, maturity_date: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* INSURANCE FORM */}
              {formData.asset_class === 'insurance' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Provider Name</label>
                      <input required type="text" placeholder="e.g. LIC India" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Policy Type</label>
                      <select required value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold cursor-pointer">
                        <option value="Term Life">Term Life Insurance</option><option value="Health">Health Insurance</option><option value="Endowment">Endowment Policy</option><option value="ULIP">ULIP</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Annual Premium (₹)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 15000" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Total Cover Amount (₹)</label>
                      <input required type="number" step="0.01" placeholder="e.g. 10000000" value={formData.coverage} onChange={(e) => setFormData({...formData, coverage: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-sm font-semibold" />
                    </div>
                  </div>
                </>
              )}

            </form>
            <div className="p-6 border-t border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] rounded-b-2xl">
              <button type="submit" form="asset-form" disabled={isSubmitting} className="w-full py-3.5 bg-[#0A3D8B] dark:bg-blue-600 hover:bg-[#082f6b] text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Syncing Execution Ledger...' : 'Commit Transaction to Database'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL: HISTORICAL LEDGER --- */}
      {selectedAssetHistory && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAssetHistory(null)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-start bg-white dark:bg-[#0a0a0a] rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">{selectedAssetHistory.symbol || selectedAssetHistory.name}</h2>
                <div className="flex space-x-3 text-xs font-bold text-gray-500"><span>{selectedAssetHistory.type}</span></div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => triggerDeleteAsset(selectedAssetHistory.id, selectedAssetHistory.name)} className="flex items-center text-xs font-bold px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 className="w-3.5 h-3.5 mr-1" /> Wipe Position</button>
                <button onClick={() => setSelectedAssetHistory(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="p-0 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-[#262626]"><th className="p-4 pl-6">Date</th><th className="p-4">Action</th><th className="p-4 text-right">Qty</th><th className="p-4 text-right">Price</th><th className="p-4 pr-6 text-center">Delete</th></tr>
                </thead>
                <tbody className="text-sm">
                  {selectedAssetHistory.history && selectedAssetHistory.history.length > 0 ? (
                    selectedAssetHistory.history.map((tx, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 pl-6 font-semibold text-[#0F172A] dark:text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${tx.action === 'Buy' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' : 'bg-red-50 text-red-700 dark:bg-red-900/30'}`}>{tx.action}</span></td>
                        <td className="p-4 text-right text-gray-600 dark:text-gray-400 font-semibold">{tx.quantity}</td>
                        <td className="p-4 text-right text-[#0F172A] dark:text-gray-300 font-bold">₹{tx.price.toLocaleString('en-IN')}</td>
                        <td className="p-4 pr-6 text-center"><button onClick={() => triggerDeleteTransaction(tx.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto block"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No records logged.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- CUSTOM CONFIRM DELETION MODAL --- */}
      {confirmDelete.isOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-2xl p-6 transform transition-all">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-5"><AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-500" /></div>
            <h3 className="text-xl font-bold text-center text-[#0F172A] dark:text-gray-200 mb-2">{confirmDelete.title}</h3>
            <p className="text-sm text-center text-gray-600 dark:text-[#a3a3a3] mb-6 leading-relaxed">{confirmDelete.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} className="flex-1 py-3 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg">Yes, Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Investments;
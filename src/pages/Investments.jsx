import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, Wallet, PieChart, Trash2,
  Building, Landmark, Shield, Bell, Calendar, Coins, ArrowUpRight, 
  ArrowDownRight, CircleDollarSign, Gem, Activity, Search, Filter, X, AlertTriangle, RefreshCw
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

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

  // Custom Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState({ 
    isOpen: false, 
    type: '', // 'asset' or 'transaction'
    id: null, 
    title: '', 
    message: '' 
  });

  // Form State for logging investments
  const [formData, setFormData] = useState({
    action: 'Buy',
    asset_class: 'market',
    asset_type: 'Stock',
    symbol: '',
    name: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchInvestments = async () => {
    try {
      const data = await api.getInvestments();
      if (data) setInvestments(data);
    } catch (error) {
      console.error("Failed to fetch investments", error);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [api]);

  // --- DATA PROCESSING ---
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
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate Global Balances
  const totalValue = safeInvestments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
  const totalInvested = safeInvestments.reduce((sum, inv) => sum + (inv.avgPrice * inv.quantity), 0);
  const overallReturn = totalValue - totalInvested;
  const overallReturnPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  // Realized P&L (LAST 12 MONTHS)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const realizedPnL12Months = safeInvestments.reduce((totalPnL, asset) => {
    const assetRealized = (asset.history || [])
      .filter(tx => tx.action === 'Sell' && new Date(tx.date) >= twelveMonthsAgo)
      .reduce((sum, tx) => sum + (tx.pnl || 0), 0);
    return totalPnL + assetRealized;
  }, 0);

  // --- DYNAMIC MARKET INTELLIGENCE ALERTS ---
  const marketAlerts = [];
  const now = new Date();

  marketAssets.forEach(asset => {
    // metadata is already parsed into an object when it comes from the API map
    const meta = asset.metadata || {};

    if (meta.exDividendDate) {
      const exDate = new Date(meta.exDividendDate);
      if (exDate > now) {
        marketAlerts.push({
          id: `div-${asset.id}`,
          type: 'dividend',
          title: `${asset.symbol} Ex-Dividend`,
          date: exDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          value: meta.dividendRate ? `₹${meta.dividendRate} / share` : 'Upcoming',
          timestamp: exDate.getTime()
        });
      }
    }

    if (meta.earningsDate) {
      const earnDate = new Date(meta.earningsDate);
      if (earnDate > now) {
        marketAlerts.push({
          id: `earn-${asset.id}`,
          type: 'earnings',
          title: `${asset.symbol} Earnings`,
          date: earnDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          value: 'Expected',
          timestamp: earnDate.getTime()
        });
      }
    }
  });

  // Sort alerts closest to today
  marketAlerts.sort((a, b) => a.timestamp - b.timestamp);

const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Trigger the backend sync
      const result = await api.syncInvestments(); 
      console.log("Sync result:", result);
      
      // 2. IMPORTANT: Force a fresh fetch from the DB to update the UI
      await fetchInvestments(); 
      
      // 3. Provide feedback
      alert(`Sync successful! Updated ${result.updated || 0} assets.`);
    } catch (err) { 
      console.error("Sync error:", err);
      alert("Sync failed. Check your API keys and terminal."); 
    }
    setIsSyncing(false);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createInvestment(formData);
      await fetchInvestments();
      setIsAddModalOpen(false);
      setFormData({ action: 'Buy', asset_class: 'market', asset_type: 'Stock', symbol: '', name: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert(error.response?.data?.error || "Failed to submit execution details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDeleteAsset = (assetId, assetName) => {
    setConfirmDelete({
      isOpen: true,
      type: 'asset',
      id: assetId,
      title: 'Wipe Asset Position?',
      message: `Are you absolutely sure you want to completely purge ${assetName || 'this asset'} and all of its associated transaction logs? This action cannot be undone.`
    });
  };

  const triggerDeleteTransaction = (txId) => {
    setConfirmDelete({
      isOpen: true,
      type: 'transaction',
      id: txId,
      title: 'Delete Execution Record?',
      message: 'Are you sure you want to delete this specific historical execution record? The asset\'s average buy price and total quantity will automatically adjust.'
    });
  };

  const executeDelete = async () => {
    try {
      if (confirmDelete.type === 'asset') {
        await api.deleteInvestment(confirmDelete.id);
        setSelectedAssetHistory(null);
      } else if (confirmDelete.type === 'transaction') {
        await api.deleteInvestmentTransaction(confirmDelete.id);
        setSelectedAssetHistory(null);
      }
      await fetchInvestments();
    } catch (err) {
      console.error("Deletion failure", err);
      alert("Failed to delete record. Please check the console.");
    } finally {
      setConfirmDelete({ isOpen: false, type: '', id: null, title: '', message: '' });
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-5 py-3 text-sm font-bold rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-[#0A3D8B] dark:bg-blue-600 text-white shadow-md' 
          : 'bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626]'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="flex-1 overflow-auto p-4 pb-28 md:p-10 md:pb-10 relative">
      
      {/* HEADER & OVERVIEW CARDS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Wealth Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Track and manage your multi-asset investments.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-900/30 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
            {isSyncing ? 'Syncing...' : 'Live Market Sync'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-5 py-2.5 bg-[#0F172A] dark:bg-gray-200 text-white dark:text-[#0F172A] rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#262626] text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Wallet className="w-32 h-32" /></div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-blue-200 mb-2">Total Net Portfolio</p>
          <h2 className="text-3xl font-bold mb-1">₹{totalValue.toLocaleString('en-IN')}</h2>
          <p className="text-sm text-blue-200">Across all asset classes</p>
        </div>
        
        {/* NEW Interactive Live Market Sync Card */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1">Data Pipeline Status</p>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">FMP & CoinGecko Engine</h2>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="mt-4 w-full py-2 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-[#262626] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" /> Fetching Live LTP...</>
            ) : (
              <><Activity className="w-3.5 h-3.5 text-emerald-500" /> Force Global Price Sync</>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Overall Unrealized ROI</p>
          <div className="flex items-end space-x-2">
            <h2 className={`text-2xl font-bold ${overallReturn >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
              {overallReturn >= 0 ? '+' : ''}₹{overallReturn.toLocaleString('en-IN')}
            </h2>
          </div>
          <div className={`inline-flex items-center mt-2 px-2 py-1 rounded bg-opacity-20 text-xs font-bold ${overallReturn >= 0 ? 'bg-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-red-500 text-red-600 dark:text-red-400'}`}>
            {overallReturn >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {overallReturnPct.toFixed(2)}% Total Yield
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex flex-wrap gap-3 mb-6">
        <TabButton id="market" label="Markets & Crypto" icon={Activity} />
        <TabButton id="commodities" label="Commodities" icon={Gem} />
        <TabButton id="real_estate" label="Real Estate" icon={Building} />
        <TabButton id="fixed_income" label="Fixed Income & Safety" icon={Shield} />
      </div>

      {/* --- TAB CONTENT: MARKETS --- */}
      {activeTab === 'market' && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden">
            
            <div className="p-6 border-b border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Active Holdings</h3>
              </div>
              
              <div className="flex w-full sm:w-auto items-center space-x-3">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" placeholder="Search asset..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm text-[#0F172A] dark:text-gray-200 rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-bold text-[#0F172A] dark:text-gray-200 rounded-lg focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Stock">Stock</option>
                    <option value="ETF">ETF</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#0a0a0a] text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-[#262626]">
                    <th className="p-4">Asset</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Avg Price</th>
                    <th className="p-4 text-right">LTP</th>
                    <th className="p-4 text-right">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMarketAssets.length > 0 ? (
                    filteredMarketAssets.map(asset => (
                      <tr 
                        key={asset.id} onClick={() => setSelectedAssetHistory(asset)}
                        className="border-b border-gray-100 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#0F172A] dark:text-gray-200 group-hover:text-[#0A3D8B] dark:group-hover:text-blue-400 transition-colors">{asset.symbol || asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.name} ({asset.quantity} shares)</p>
                        </td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-gray-300 rounded text-xs font-bold">{asset.type}</span></td>
                        <td className="p-4 text-right font-semibold">₹{asset.avgPrice.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right font-bold text-[#0F172A] dark:text-gray-200">₹{asset.currentPrice.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right">
                          <p className={`font-bold ${asset.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                            {asset.pnl >= 0 ? '+' : ''}₹{asset.pnl.toLocaleString('en-IN')}
                          </p>
                          <p className={`text-xs font-bold flex items-center justify-end mt-0.5 ${asset.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                            {asset.pnl >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {asset.pnlPct}%
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No assets found matching parameters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDEBAR INTEL GRID */}
          <div className="w-full xl:w-96 flex flex-col gap-6">
            
            <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
              <div className="flex items-center space-x-2 mb-3">
                <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Realized P&L (12 Months)</p>
              </div>
              <h3 className={`text-2xl font-bold ${realizedPnL12Months >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                {realizedPnL12Months >= 0 ? '+' : ''}₹{realizedPnL12Months.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Booked cash returns locked from asset sales.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-[#1a1a2e] dark:to-[#16213e] p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center space-x-2 mb-6">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Market Intelligence</h3>
              </div>
              <div className="space-y-4">
                {marketAlerts.length > 0 ? (
                  marketAlerts.map(alert => (
                    <div key={alert.id} className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm p-4 rounded-xl border border-white dark:border-[#262626] shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {alert.type === 'dividend' ? <CircleDollarSign className="w-4 h-4 text-emerald-500" /> : <Calendar className="w-4 h-4 text-orange-500" />}
                          <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{alert.title}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{alert.date}</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{alert.value}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed text-center py-4">
                    No upcoming corporate actions or dividends detected for your portfolio.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: COMMODITIES --- */}
      {activeTab === 'commodities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {commodities.map(item => {
             const totalVal = item.currentPrice * item.quantity;
             const pnl = (item.currentPrice - item.avgPrice) * item.quantity;
             const pnlPct = item.avgPrice > 0 ? ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100 : 0;

             return (
              <div 
                key={item.id} onClick={() => setSelectedAssetHistory(item)}
                className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] group hover:-translate-y-1 hover:border-[#0A3D8B] dark:hover:border-blue-500 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.type.toLowerCase().includes('gold') ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 group-hover:text-[#0A3D8B] dark:group-hover:text-blue-400 transition-colors">{item.type}</h3>
                      <p className="text-xs text-gray-500 font-bold">{item.quantity} Units • {item.name}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#262626] pb-3"><span className="text-xs text-gray-500">Avg Buy Price</span><span className="text-sm font-bold text-[#0F172A] dark:text-gray-300">₹{item.avgPrice.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#262626] pb-3"><span className="text-xs text-gray-500">Current Market</span><span className="text-sm font-bold text-[#0F172A] dark:text-gray-300">₹{item.currentPrice.toLocaleString('en-IN')}</span></div>
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

      {/* --- TAB CONTENT: REAL ESTATE --- */}
      {activeTab === 'real_estate' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {realEstate.map(property => (
            <div key={property.id} className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-[#1a1a1a] dark:to-[#262626] relative">
                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white dark:bg-[#0a0a0a] border-4 border-white dark:border-[#121212] rounded-xl flex items-center justify-center"><Landmark className="w-5 h-5 text-[#0A3D8B] dark:text-blue-400" /></div>
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest">{property.type || 'Property'}</div>
              </div>
              <div className="p-6 pt-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">{property.name}</h3>
                    <p className="text-xs text-gray-500">{property.metadata?.location || 'Properties Portfolio'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-xl">
                  <div><p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Purchase Cost</p><p className="text-sm font-semibold text-[#0F172A] dark:text-gray-300">₹{property.avgPrice.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Estimated Value</p><p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹{property.currentPrice.toLocaleString('en-IN')}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB CONTENT: FIXED INCOME --- */}
      {activeTab === 'fixed_income' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
             <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-[#262626] pb-4">
              <div className="flex items-center space-x-2"><Landmark className="w-5 h-5 text-indigo-600" /><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Fixed Income Ledger</h3></div>
            </div>
            <div className="space-y-6">
              {fixedIncome.map(fd => (
                <div key={fd.id} className="relative flex justify-between items-center">
                  <div><h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{fd.name}</h4></div>
                  <div className="text-right"><p className="text-sm font-bold text-[#0A3D8B] dark:text-blue-400">₹{fd.quantity.toLocaleString('en-IN')}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-[#262626] pb-4">
              <div className="flex items-center space-x-2"><Shield className="w-5 h-5 text-emerald-600" /><h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Policies Assured</h3></div>
            </div>
            <div className="space-y-4">{insurance.map(ins => (<div key={ins.id} className="text-sm text-gray-400">{ins.name}</div>))}</div>
          </div>
        </div>
      )}


      {/* --- MODAL: ADD / SELL ASSET --- */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a] rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Record Asset Transaction</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Live Database Entry</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            
            <form id="asset-form" onSubmit={handleAddAsset} className="p-6 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Buy', 'Sell'].map(act => (
                    <div 
                      key={act} onClick={() => setFormData({...formData, action: act})}
                      className={`cursor-pointer py-3 rounded-xl text-xs font-bold text-center border transition-all ${formData.action === act ? 'bg-[#0A3D8B] text-white border-transparent' : 'bg-gray-50 dark:bg-[#0a0a0a] border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400'}`}
                    >
                      {act === 'Buy' ? '🟢 Buy / Add Asset' : '🔴 Sell / Reduce Asset'}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Asset Class</label>
                <select 
                  required value={formData.asset_class} onChange={(e) => setFormData({...formData, asset_class: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#0A3D8B] transition-colors cursor-pointer"
                >
                  <option value="market">Stock / ETF / Mutual Fund / Crypto</option>
                  <option value="commodity">Physical Gold / Silver</option>
                  <option value="real_estate">Real Estate (Land/Property)</option>
                  <option value="fixed_income">Fixed Deposit / Bond</option>
                  <option value="insurance">Insurance Policy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Specific Asset Identifier Class</label>
                <input required type="text" placeholder="Stock, Crypto, FD, Gold, etc." value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Asset Name</label>
                  <input required type="text" placeholder="e.g. Delhivery" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Symbol / Ticker</label>
                  <input type="text" placeholder="e.g. DELHIVERY" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Quantity / Units</label>
                  <input required type="number" step="0.00001" placeholder="shares volume" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">{formData.action === 'Buy' ? 'Execution Buy Price' : 'Execution Sell Price'} (₹)</label>
                  <input required type="number" step="0.01" placeholder="Price value" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#0A3D8B]" />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] rounded-b-2xl">
              <button 
                type="submit" form="asset-form" disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0A3D8B] dark:bg-blue-600 hover:bg-[#082f6b] text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Syncing Execution Ledger...' : 'Commit Transaction to Database'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL: DETAILED ASSET OVERVIEW & HISTORICAL TRANSACTION LEDGER --- */}
      {selectedAssetHistory && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAssetHistory(null)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-start bg-white dark:bg-[#0a0a0a] rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">{selectedAssetHistory.symbol || selectedAssetHistory.name}</h2>
                <div className="flex space-x-3 text-xs font-bold text-gray-500">
                  <span>{selectedAssetHistory.type}</span>
                  <span>•</span>
                  <span>Open Returns: <span className={selectedAssetHistory.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}>₹{(selectedAssetHistory.pnl || 0).toLocaleString('en-IN')}</span></span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => triggerDeleteAsset(selectedAssetHistory.id, selectedAssetHistory.name)}
                  className="flex items-center text-xs font-bold px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Wipe Position
                </button>
                <button onClick={() => setSelectedAssetHistory(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="p-0 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-[#262626]">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 pr-6 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {selectedAssetHistory.history && selectedAssetHistory.history.length > 0 ? (
                    selectedAssetHistory.history.map((tx, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-4 pl-6 font-semibold text-[#0F172A] dark:text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${tx.action === 'Buy' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' : 'bg-red-50 text-red-700 dark:bg-red-900/30'}`}>
                            {tx.action}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-600 dark:text-gray-400 font-semibold">{tx.quantity}</td>
                        <td className="p-4 text-right text-[#0F172A] dark:text-gray-300 font-bold">₹{tx.price.toLocaleString('en-IN')}</td>
                        <td className="p-4 pr-6 text-center">
                          <button 
                            onClick={() => triggerDeleteTransaction(tx.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mx-auto block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No records logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- CUSTOM DELETION CONFIRMATION MODAL --- */}
      {confirmDelete.isOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}></div>
          
          <div className="relative w-full max-w-sm bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-2xl p-6 transform transition-all">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-5">
              <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-center text-[#0F172A] dark:text-gray-200 mb-2">{confirmDelete.title}</h3>
            <p className="text-sm text-center text-gray-600 dark:text-[#a3a3a3] mb-6 leading-relaxed">
              {confirmDelete.message}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                className="flex-1 py-3 bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Investments;
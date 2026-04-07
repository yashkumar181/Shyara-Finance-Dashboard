import React, { useState, useEffect } from 'react';
import { 
  Download, ChevronDown, MoreVertical, 
  ChevronRight, Search, Laptop, Home, 
  ShoppingCart, Tv, CreditCard, Trash2
} from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const iconMap = { Laptop, Home, ShoppingCart, Tv, CreditCard };

const Transactions = () => {
  const api = useApi();
  const { transactions, transactionsLoading, setTransactions, setTransactionsLoading } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('All Accounts');
  const [sortOrder, setSortOrder] = useState('Date (Newest)');
  
  const [accountsList, setAccountsList] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const fetchLedger = async () => {
      // ONLY trigger loading screen if we have no cached transactions
      if (useAppStore.getState().transactions.length === 0) {
        setTransactionsLoading(true);
      }
      try {
        const [txData, accData] = await Promise.all([
          api.getTransactions(),
          api.getAccounts()
        ]);
        setTransactions(txData);
        setAccountsList(accData || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchLedger();
  }, [api, setTransactions, setTransactionsLoading]);

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this transaction?")) return;
    try {
      await api.deleteTransaction(id);
      setTransactions(useAppStore.getState().transactions.filter(t => t.id !== id));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting transaction", error);
      alert("Failed to delete transaction.");
    }
  };

  let processedTransactions = transactions.filter((tx) => {
    const merchantName = tx.merchant || tx.name || "Unknown";
    const source = tx.accountName || "Unknown";
    
    const matchesSearch = merchantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = accountFilter === 'All Accounts' || source === accountFilter;
    
    return matchesSearch && matchesAccount;
  });

  processedTransactions = processedTransactions.sort((a, b) => {
    if (sortOrder === 'Amount (High to Low)') return b.amount - a.amount;
    if (sortOrder === 'Amount (Low to High)') return a.amount - b.amount;
    if (sortOrder === 'Date (Oldest)') return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });

  const clearFilters = () => {
    setSearchTerm(''); setAccountFilter('All Accounts'); setSortOrder('Date (Newest)');
  };

  const handleExportCSV = () => {
    const headers = "Date,Merchant,Description,Category,Account,Amount,Type\n";
    const csvRows = processedTransactions.map(tx => 
      `"${new Date(tx.date).toLocaleDateString()}","${tx.merchant || tx.name}","${tx.notes || ''}","${tx.category}","${tx.accountName}","${tx.amount}","${tx.type}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_export_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Surgical overview of your fiscal movements.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-[#F8F9FA] dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-4 md:p-6 flex flex-col xl:flex-row gap-4 border-b border-gray-200 dark:border-[#262626] items-start xl:items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-[#a3a3a3]" />
              <input type="text" placeholder="Search merchants or descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-semibold rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm" />
            </div>
            
            <div className="relative">
              <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-semibold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm">
                <option value="All Accounts">All Accounts</option>
                {accountsList.map(acc => (
                  <option key={acc.id} value={acc.nickname}>{acc.nickname}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3]" /></div>
            </div>

            <div className="relative">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0A3D8B] dark:text-gray-200 text-xs font-bold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm">
                <option>Date (Newest)</option><option>Date (Oldest)</option><option>Amount (High to Low)</option><option>Amount (Low to High)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-[#0A3D8B] dark:text-[#a3a3a3]" /></div>
            </div>
          </div>
          <button onClick={clearFilters} className="text-[#0A3D8B] dark:text-[#a3a3a3] text-xs font-bold hover:underline px-2 whitespace-nowrap">Reset</button>
        </div>

        <div className="overflow-x-auto min-h-[300px] pb-32">
          {/* Changed condition to not block screen if data is already in Zustand */}
          {(transactionsLoading && transactions.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
              <p className="text-sm font-semibold animate-pulse">Loading ledgers...</p>
            </div>
          ) : processedTransactions.length > 0 ? (
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#262626]">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Merchant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Payment Source</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
                {processedTransactions.map((tx) => {
                  const MerchIcon = iconMap[tx.icon] || ShoppingCart;
                  const isPositive = tx.type === 'income';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors relative">
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-[#262626] text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                          <MerchIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200 whitespace-nowrap">{tx.merchant || tx.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">{tx.notes || 'No description'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-medium text-gray-500 dark:text-[#a3a3a3] flex items-center">
                          {tx.category || 'General'} 
                          {tx.subCategory && <><ChevronRight className="w-3 h-3 mx-1 text-gray-300 dark:text-gray-600" /> <span className="text-[#0A3D8B] dark:text-gray-200 font-bold">{tx.subCategory}</span></>}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400 dark:text-[#a3a3a3] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{tx.accountName || 'Cash'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0F172A] dark:text-gray-200'}`}>
                          {isPositive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-[#262626] dark:text-emerald-400' : 'bg-gray-200 text-gray-700 dark:bg-[#262626] dark:text-gray-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)} 
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-[#a3a3a3] p-1 rounded hover:bg-gray-100 dark:hover:bg-[#262626]"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === tx.id && (
                          <div className="absolute right-8 top-10 mt-1 w-40 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl py-2 z-50 animate-fade-slide-up">
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)} 
                              className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Entry
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
              <Search className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-semibold">No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
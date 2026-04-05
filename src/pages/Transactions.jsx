import React, { useState } from 'react';
import { 
  Download, Plus, ChevronDown, MoreVertical, 
  ChevronLeft, ChevronRight, Search, Laptop, Home, 
  ShoppingCart, Tv, CreditCard
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import AddTransactionModal from '../components/AddTransactionModal';

const iconMap = { Laptop, Home, ShoppingCart, Tv, CreditCard };

const Transactions = () => {
  const { transactions, role } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [accountFilter, setAccountFilter] = useState('All Accounts');
  const [sortOrder, setSortOrder] = useState('Date (Newest)');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parseAmount = (amountStr) => parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));

  let processedTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || tx.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || tx.catMain === categoryFilter;
    const matchesAccount = accountFilter === 'All Accounts' || tx.source === accountFilter;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  processedTransactions = processedTransactions.sort((a, b) => {
    if (sortOrder === 'Amount (High to Low)') return parseAmount(b.amount) - parseAmount(a.amount);
    if (sortOrder === 'Amount (Low to High)') return parseAmount(a.amount) - parseAmount(b.amount);
    if (sortOrder === 'Date (Oldest)') return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });

  const clearFilters = () => {
    setSearchTerm(''); setCategoryFilter('All Categories'); setAccountFilter('All Accounts'); setSortOrder('Date (Newest)');
  };

  const handleExportCSV = () => {
    const headers = "Date,Time,Merchant,Category,Account,Amount,Status\n";
    const csvRows = processedTransactions.map(tx => `"${tx.date}","${tx.time}","${tx.merchant}","${tx.catMain}","${tx.source}","${tx.amount}","${tx.status}"`).join("\n");
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
          {role === 'Admin' && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-blue-500 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Transaction
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-4 md:p-6 flex flex-col xl:flex-row gap-4 border-b border-gray-200 dark:border-[#262626] items-start xl:items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-[#a3a3a3]" />
              <input type="text" placeholder="Search merchants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-semibold rounded-lg focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm" />
            </div>
            <div className="relative">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-semibold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm">
                <option>All Categories</option><option>Leisure</option><option>Travel</option><option>Personal</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3]" /></div>
            </div>
            <div className="relative">
              <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-semibold rounded-lg appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500 shadow-sm">
                <option>All Accounts</option><option>Amex Gold</option><option>Chase Sapphire</option><option>Manual Entry</option>
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

        <div className="overflow-x-auto min-h-[300px]">
          {processedTransactions.length > 0 ? (
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#262626]">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Merchant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Payment Source</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Tagging</th>
                  {role === 'Admin' && <th className="px-6 py-4"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
                {processedTransactions.map((tx) => {
                  const MerchIcon = iconMap[tx.icon] || ShoppingCart;
                  const SourceIcon = iconMap[tx.sourceIcon] || CreditCard;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 whitespace-nowrap">{tx.date}</p>
                        <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">{tx.time}</p>
                      </td>
                      <td className="px-6 py-5 flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${tx.iconBg.replace('bg-', 'bg-').concat(' dark:bg-[#262626] dark:opacity-80')} ${tx.iconColor} dark:text-gray-300 flex items-center justify-center shrink-0`}><MerchIcon className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200 whitespace-nowrap">{tx.merchant}</p>
                          <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">{tx.desc}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5"><p className="text-[11px] font-medium text-gray-500 dark:text-[#a3a3a3] flex items-center">{tx.catMain} <ChevronRight className="w-3 h-3 mx-1 text-gray-300 dark:text-gray-600" /> <span className="text-[#0A3D8B] dark:text-gray-200 font-bold">{tx.catSub}</span></p></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <SourceIcon className="w-5 h-5 text-gray-400 dark:text-[#a3a3a3] shrink-0" />
                          <div><p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{tx.source}</p><p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">• {tx.sourceLast}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <p className={`text-sm font-bold ${tx.amountType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0F172A] dark:text-gray-200'}`}>{tx.amount}</p>
                        {tx.subAmount && <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">{tx.subAmount}</p>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          {tx.tag1 && <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${tx.tag1.color.includes('bg-') ? tx.tag1.color.replace('bg-[', 'bg-[').concat(' dark:bg-[#262626] dark:text-gray-300') : tx.tag1.color} ${!tx.tag1.active && 'bg-transparent dark:text-gray-500'}`}>{tx.tag1.label}</span>}
                          {tx.tag2 && <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider ${tx.tag2.color} ${!tx.tag2.active && 'bg-transparent dark:text-gray-500'}`}>{tx.tag2.label}</span>}
                        </div>
                      </td>
                      {role === 'Admin' && <td className="px-6 py-5 text-right"><button className="text-gray-400 hover:text-gray-600 dark:hover:text-[#a3a3a3]"><MoreVertical className="w-5 h-5" /></button></td>}
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

        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-medium text-gray-500 dark:text-[#a3a3a3]">
            Showing <span className="font-bold text-[#0F172A] dark:text-gray-200">{processedTransactions.length}</span> transactions
          </p>
          <div className="flex items-center space-x-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-[#262626] text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0A3D8B] dark:bg-[#262626] text-white dark:text-gray-200 text-xs font-bold shadow-sm border border-transparent dark:border-[#262626]">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Transactions;
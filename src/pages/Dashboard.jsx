import React, { useState } from 'react';
import { Wallet, CreditCard, PiggyBank, TrendingUp, Home, GraduationCap, Plus, Laptop, ShoppingCart, Tv } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import LineChart from '../components/charts/LineChart';
import { merchantsData, chartDataMap } from '../data/mockData';

const iconMap = { Laptop, Home, ShoppingCart, Tv, CreditCard };

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const { transactions } = useFinance();
  const [chartTimeframe, setChartTimeframe] = useState('monthly');

  return (
    <div className="p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Portfolio Synopsis</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Metric oversight for the current fiscal quarter</p>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-lg p-1 flex shadow-sm border border-gray-200 dark:border-[#262626] overflow-x-auto">
          {['monthly', 'quarterly', 'annual'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-md ${activeTab === tab ? 'bg-white dark:bg-[#262626] text-[#0A3D8B] dark:text-gray-200' : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-gray-300'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><Wallet className="w-5 h-5" /></div>
            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full">+12.4%</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Net Worth</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-4">₹2,482,910.42</h3>
          <div className="w-16 h-1 bg-[#0A3D8B] dark:bg-gray-400 rounded-full"></div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><CreditCard className="w-5 h-5" /></div>
            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full">+4.2%</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Monthly Cash Flow</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">₹14,290.00</h3>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3] uppercase">Efficiency: <span className="text-emerald-500">A-</span></p>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><PiggyBank className="w-5 h-5" /></div>
            <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full">-1.8%</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Discretionary Surplus</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">₹3,104.50</h3>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3]">Remaining cycle: 8 days</p>
        </div>

        <div className="bg-[#0A3D8B] dark:bg-gray-800 p-6 rounded-2xl shadow-md text-white border dark:border-[#262626]">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-8 shrink-0"><TrendingUp className="w-5 h-5 text-white" /></div>
          <p className="text-[10px] font-bold text-blue-200 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Savings Rate</p>
          <h3 className="text-4xl font-bold mb-4">42.5%</h3>
          <p className="text-[9px] font-semibold text-blue-200 dark:text-[#a3a3a3] uppercase tracking-wide">Outperforming index by 12%</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        <div className="w-full xl:w-2/3 space-y-6">
          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base">Fiscal Velocity</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
                <div className="bg-gray-100 dark:bg-[#0a0a0a] rounded-lg p-1 flex w-full sm:w-auto border border-transparent dark:border-[#262626]">
                  {['daily', 'weekly', 'monthly'].map(tf => (
                    <button key={tf} onClick={() => setChartTimeframe(tf)} className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${chartTimeframe === tf ? 'bg-white dark:bg-[#262626] text-[#0A3D8B] dark:text-gray-200 shadow-sm' : 'text-gray-400 dark:text-[#a3a3a3]'}`}>{tf}</button>
                  ))}
                </div>
                <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>INCOME</div>
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>EXPENSES</div>
                </div>
              </div>
            </div>
            <LineChart data={chartDataMap[chartTimeframe]} />
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base mb-1">Allocation Waterfall</h3>
            <p className="text-xs text-gray-400 dark:text-[#a3a3a3] mb-8">Distinction between fixed liabilities and variable lifestyle spend</p>
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wide">
                <span className="text-[#0F172A] dark:text-gray-200">Total Inflow</span>
                <span className="text-[#0F172A] dark:text-gray-200">₹18,400</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-[#0A3D8B] dark:bg-gray-400 w-full rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide mb-1">Committed</div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 dark:text-[#a3a3a3] uppercase">(Mortgage, Utils)</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹8,200</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden"><div className="h-full bg-gray-600 dark:bg-gray-600 w-3/4 rounded-full"></div></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide mb-1">Discretionary</div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 dark:text-[#a3a3a3] uppercase">(Travel, Dining)</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹3,104</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-1/3 rounded-full"></div></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide mb-1">Residual Surplus</div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 uppercase">&nbsp;</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹6,096</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden"><div className="h-full bg-[#0A3D8B] dark:bg-gray-400 w-1/2 rounded-full"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-1/3 space-y-6">
          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base">Strategic Goals</h3>
              <button className="w-6 h-6 rounded-full bg-[#0A3D8B] dark:bg-[#262626] text-white flex items-center justify-center shrink-0"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center"><Home className="w-4 h-4 text-rose-600 dark:text-gray-400 mr-3 shrink-0" /><span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Modernist Retreat</span></div>
                <span className="text-sm font-bold text-gray-500 dark:text-[#a3a3a3]">82%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-2"><div className="h-full bg-rose-600 dark:bg-gray-500 w-[82%] rounded-full"></div></div>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold">₹164,000 of ₹200,000</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center"><GraduationCap className="w-4 h-4 text-[#0A3D8B] dark:text-gray-400 mr-3 shrink-0" /><span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Education Fund</span></div>
                <span className="text-sm font-bold text-gray-500 dark:text-[#a3a3a3]">34%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-2"><div className="h-full bg-[#0A3D8B] dark:bg-gray-500 w-[34%] rounded-full"></div></div>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold">₹42,500 of ₹125,000</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base mb-6">Primary Merchants</h3>
            <div className="space-y-6">
              {merchantsData.map((merchant) => (
                <div key={merchant.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full ${merchant.bg.replace('bg-gray-800', 'bg-[#262626]')} ${merchant.text} flex items-center justify-center font-bold text-sm shrink-0`}>{merchant.initial}</div>
                    <div>
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{merchant.name}</p>
                      <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">{merchant.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{merchant.amount}</p>
                    <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3]">{merchant.freq}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-[#262626] gap-4">
          <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base">Recent Transactional History</h3>
          <button className="text-xs font-bold text-[#0A3D8B] dark:text-gray-400 hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#262626]">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {transactions.slice(0, 3).map((tx) => {
                const Icon = iconMap[tx.icon] || ShoppingCart;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-[#a3a3a3] font-medium">{tx.date}</td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded ${tx.iconBg.replace('bg-gray-800', 'bg-[#262626]').concat(' dark:opacity-80 dark:bg-[#262626]')} ${tx.iconColor} dark:text-gray-300 flex items-center justify-center shrink-0`}><Icon className="w-4 h-4" /></div>
                      <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{tx.merchant}</span>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-[#0a0a0a] text-gray-600 dark:text-[#a3a3a3] text-[9px] font-bold rounded uppercase">{tx.catMain}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-bold ${tx.amountType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0F172A] dark:text-gray-200'}`}>{tx.amount}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${tx.status === 'Cleared' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/50'}`}>{tx.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
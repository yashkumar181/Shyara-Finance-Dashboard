import React from 'react';
import { 
  TrendingUp, Wallet, Activity, PieChart, BarChart2, 
  ChevronDown, Filter, History, Lightbulb, Building2, 
  BarChart3, Landmark, MoreHorizontal
} from 'lucide-react';
import { investmentsData, portfolioPerformanceData } from '../data/mockData';
import AreaChart from '../components/charts/AreaChart';

const Investments = () => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Investment Portfolio</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Tracking across 12 active accounts</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-[#F8F9FA] dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
            Export Report
          </button>
          <button className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-gray-700 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-gray-600 transition-colors shadow-sm">
            Rebalance Portfolio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-md text-white relative overflow-hidden flex flex-col justify-between h-40 border border-transparent dark:border-[#262626]">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
            <Wallet className="w-48 h-48" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-blue-200 tracking-widest uppercase mb-1">Current Value</p>
            <h3 className="text-3xl lg:text-4xl font-bold mb-3 dark:text-gray-100">₹428,592.12</h3>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +₹12,402.50
              </span>
              <span className="text-[10px] text-blue-200">Today's Performance</span>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Total Invested</p>
            <h3 className="text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-gray-200">₹312,000.00</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Cash Basis</p>
            <Wallet className="w-5 h-5 text-[#0A3D8B] dark:text-gray-400" />
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-40">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Portfolio XIRR</p>
            <h3 className="text-2xl lg:text-3xl font-bold text-[#991B1B] dark:text-emerald-500">14.82%</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Annualized</p>
            <Activity className="w-5 h-5 text-[#991B1B] dark:text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* AREA CHART */}
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
          <AreaChart data={portfolioPerformanceData} />
        </div>

        {/* PIE CHART */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Asset Allocation</h2>
            <PieChart className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="42.5 57.5" strokeDashoffset="0"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="28.1 71.9" strokeDashoffset="-42.5"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15.4 84.6" strokeDashoffset="-70.6"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="14 86" strokeDashoffset="-86"></circle>
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-1">
                <span className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Total</span>
                <span className="block text-xl font-bold text-[#0F172A] dark:text-gray-200">5 Assets</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Stocks & ETFs</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">42.5%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-violet-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Mutual Funds</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">28.1%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-3"></div><span className="text-gray-600 dark:text-[#a3a3a3] font-semibold">Real Estate</span></div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">15.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 md:p-8 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Monthly Mandates</h2>
            <span className="bg-[#E0E7FF] dark:bg-[#202A40] text-[#0A3D8B] dark:text-blue-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-transparent dark:border-[#262626]">Active</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#262626] flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-0.5">Vanguard 500 SIP</p>
                <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold uppercase tracking-widest">Next: Oct 05</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#0A3D8B] dark:text-gray-300 mb-0.5">₹1,200.00</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#262626] flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-0.5">Gold Accumulation Plan</p>
                <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold uppercase tracking-widest">Next: Oct 12</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#0A3D8B] dark:text-gray-300 mb-0.5">₹450.00</p>
              </div>
            </div>
          </div>
          <button className="w-full bg-transparent border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-[#a3a3a3] rounded-xl py-3 text-xs font-bold hover:bg-white dark:hover:bg-[#202A40] hover:text-[#0A3D8B] dark:hover:text-gray-200 transition-colors uppercase tracking-wide">
            + Add New Automation
          </button>
        </div>

        <div className="bg-[#0F172A] dark:bg-[#1A2235] p-8 rounded-2xl shadow-md flex flex-col justify-between border border-transparent dark:border-blue-900/30">
          <div className="mb-4">
            <span className="bg-blue-600 dark:bg-blue-800 text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">Pro Insight</span>
          </div>
          <div className="flex justify-between items-start gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Tax Harvesting Opportunity</h3>
              <p className="text-xs text-gray-400 dark:text-blue-100 leading-relaxed mb-6">
                You have ₹2,400 in unrealized short-term losses. Consider switching some equity holdings to offset gains.
              </p>
              <button className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-white pb-0.5 hover:text-blue-200 hover:border-blue-200 transition-colors">
                Review Harvest strategy
              </button>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center mb-4 border border-gray-200 dark:border-[#262626]">
            <History className="w-5 h-5 text-gray-500 dark:text-[#a3a3a3]" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-2">Recent Activity</h3>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6 max-w-xs">
            Switch of ₹5,000 from Alpha MF to Beta Stocks completed yesterday.
          </p>
          <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-gray-400 tracking-widest uppercase hover:underline">
            View History
          </button>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-[#262626] gap-4">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Active Holdings</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-[10px] font-bold rounded-md appearance-none focus:outline-none focus:border-[#0A3D8B] shadow-sm">
                <option>Sort by Gain (High to Low)</option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-[#a3a3a3]" />
              </div>
            </div>
            <button className="flex items-center justify-center px-2 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-md shadow-sm text-gray-500 hover:text-[#0F172A] dark:hover:text-gray-200">
              <Filter className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626] bg-gray-100 dark:bg-[#0a0a0a]">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Asset Name</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Current Value</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">1-Day Change</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Total Gain</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Goal Link</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {investmentsData.map((item) => {
                const Icon = item.icon;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-5 flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${item.iconBg.replace('bg-gray-800', 'bg-[#262626]')} ${item.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{item.name}</p>
                        <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold tracking-widest uppercase mt-0.5">{item.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{item.value}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className={`text-xs font-bold ${item.dayChangeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : item.dayChangeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-[#a3a3a3]'}`}>
                        {item.dayChange}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className={`text-sm font-bold ${item.gainType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.totalGain}
                      </p>
                      <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">ROI: {item.roi}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-[#F0F5FF] dark:bg-[#0a0a0a] text-[#0A3D8B] dark:text-gray-400 border border-transparent dark:border-[#262626] text-[8px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                        {item.goal}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button className="text-gray-500 dark:text-[#a3a3a3] hover:text-[#0A3D8B] dark:hover:text-gray-300 transition-colors">
                        <MoreHorizontal className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] border-t border-gray-200 dark:border-[#262626] p-4 text-center">
          <button className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase hover:text-[#0A3D8B] dark:hover:text-gray-300 flex items-center justify-center w-full">
            View All 42 Assets <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Investments;
import React from 'react';
import { Calendar, Download, PieChart, MoreHorizontal, Cloud, ShoppingBag, Landmark, ExternalLink, ChevronDown } from 'lucide-react';

const Goals = () => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Architectural Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Surgical precision in your fiscal reporting cycle.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-50 dark:hover:bg-[#202A40] transition-colors">
            <Calendar className="w-4 h-4 mr-2" /> OCT 01 - OCT 31, 2023
          </button>
          <button className="flex items-center px-4 py-2 bg-[#F8F9FA] dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" /> EXPORT PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase">Spending By Category</h3>
            <PieChart className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-6">$14,280.00</h2>
          
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

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-4">Efficiency Ratio</h3>
          <div className="flex items-end space-x-2 mb-4">
            <h2 className="text-4xl font-bold text-[#1E3A8A] dark:text-gray-300">72:28</h2>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest pb-1 leading-tight">Essential<br/>/ Wants</div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#1E3A8A] dark:bg-gray-400 w-[72%] rounded-full"></div>
          </div>
          <div className="bg-white dark:bg-[#262626] p-4 rounded-xl border border-transparent dark:border-[#262626] flex-1 flex items-center shadow-sm">
            <div>
              <p className="text-[8px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1.5">Curator Insight</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 italic leading-relaxed">"Essential spending increased by 4% due to energy index shift. Non-essential liquidity remains healthy."</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-[#262626] flex items-center justify-center text-orange-500 dark:text-gray-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Merchant: Swiggy</h4>
                <p className="text-[8px] text-gray-500 dark:text-[#a3a3a3] font-bold tracking-widest uppercase">Selected Detail</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-[8px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Avg Ticket Size</p>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">$24.50</h3>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Frequency</p>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">12/mo</h3>
            </div>
          </div>

          <div>
            <p className="text-[8px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-3">Recent Activity</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center text-gray-500 dark:text-[#a3a3a3]"><div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 mr-3"></div>Oct 24, 2023</div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">-$28.12</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center text-gray-500 dark:text-[#a3a3a3]"><div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 mr-3"></div>Oct 21, 2023</div>
                <span className="font-bold text-[#0F172A] dark:text-gray-200">-$19.45</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3] mb-1 tracking-widest uppercase">Upcoming Obligations</h2>
            <p className="text-[11px] text-gray-500 dark:text-[#a3a3a3]">Projection for next 30 days based on recurring cycles</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-[#991B1B] dark:text-red-400">-$2,140.00</span>
            <span className="bg-red-50 dark:bg-[#262626] text-red-700 dark:text-red-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-transparent dark:border-[#262626]">Pending</span>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-8 md:justify-between hide-scrollbar">
          <div className="min-w-fit flex flex-col">
            <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold uppercase tracking-wider mb-1">Nov 02</p>
            <p className="text-[11px] font-bold text-[#0F172A] dark:text-gray-200 mb-2">AWS Cloud</p>
            <div className="w-2 h-2 rounded-full bg-[#1E3A8A] dark:bg-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-2">$142.00</p>
            <span className="bg-[#F0F5FF] dark:bg-[#0a0a0a] text-[#1E3A8A] dark:text-gray-400 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit border border-transparent dark:border-[#262626]">SAAS</span>
          </div>
          <div className="min-w-fit flex flex-col">
            <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold uppercase tracking-wider mb-1">Nov 05</p>
            <p className="text-[11px] font-bold text-[#0F172A] dark:text-gray-200 mb-2">Rent / Lease</p>
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] dark:bg-gray-500 mb-2"></div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-2">$1,200.00</p>
            <span className="bg-blue-50 dark:bg-[#0a0a0a] text-blue-600 dark:text-gray-400 border border-blue-100 dark:border-[#262626] text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit">FIXED</span>
          </div>
          <div className="min-w-fit flex flex-col">
            <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3] font-bold uppercase tracking-wider mb-1">Nov 18</p>
            <p className="text-[11px] font-bold text-[#0F172A] dark:text-gray-200 mb-2">Netflix Premium</p>
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 mb-2"></div>
            <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200 mb-2">$19.99</p>
            <span className="bg-orange-50 dark:bg-[#0a0a0a] text-orange-700 dark:text-gray-400 border border-transparent dark:border-[#262626] text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit">LIFESTYLE</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden mb-8">
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-[#262626] gap-4">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Precision Transaction Audit</h3>
          <div className="flex space-x-3">
            <button className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-md text-[10px] font-bold text-[#0F172A] dark:text-gray-200 w-32 shadow-sm">
              All Assets <ChevronDown className="w-3 h-3 text-gray-500 dark:text-[#a3a3a3]" />
            </button>
            <button className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-md text-[10px] font-bold text-[#0F172A] dark:text-gray-200 w-32 shadow-sm">
              Monthly View <ChevronDown className="w-3 h-3 text-gray-500 dark:text-[#a3a3a3]" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#262626]">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Reference</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Merchant & Category</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Volume</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-5 text-xs font-bold text-[#1E3A8A] dark:text-gray-400">#TXN-88210</td>
                <td className="px-6 py-5 flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#F0F5FF] dark:bg-[#262626] flex items-center justify-center text-[#1E3A8A] dark:text-gray-300 shrink-0">
                    <Cloud className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">DigitalOcean Holdings</p>
                    <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3]">Subscriptions</p>
                  </div>
                </td>
                <td className="px-6 py-5 text-[11px] font-medium text-gray-600 dark:text-[#a3a3a3]">Oct 28, 2023</td>
                <td className="px-6 py-5 text-xs font-bold text-[#991B1B] dark:text-red-400 text-right">-$48.00</td>
                <td className="px-6 py-5 text-center">
                  <span className="bg-[#3A2218] dark:bg-[#262626] text-white dark:text-gray-300 text-[8px] font-bold px-2 py-1.5 rounded uppercase tracking-widest">Settled</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="text-gray-400 dark:text-[#a3a3a3] hover:text-[#1E3A8A] dark:hover:text-gray-300 transition-colors"><ExternalLink className="w-4 h-4 mx-auto" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-gray-100 dark:bg-[#121212] border-t border-gray-200 dark:border-[#262626] p-4 text-center">
          <button className="text-[9px] font-bold text-[#1E3A8A] dark:text-gray-400 tracking-widest uppercase hover:underline">View Full Archive (142 Transactions)</button>
        </div>
      </div>

    </div>
  );
};

export default Goals;
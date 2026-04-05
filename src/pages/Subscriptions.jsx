import React from 'react';
import { 
  TrendingUp, AlertTriangle, History, Download, Plus, PiggyBank, Calendar
} from 'lucide-react';
import { subscriptionsData } from '../data/mockData';

const Subscriptions = () => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-4">Total Monthly Burn</p>
            <h2 className="text-5xl font-bold text-[#0F172A] dark:text-gray-200 mb-3">$428.50</h2>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center mb-8">
              <TrendingUp className="w-4 h-4 mr-1" />
              +$12.99 <span className="text-gray-400 dark:text-gray-500 ml-1 font-medium">since last month</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-[#F0F5FF] dark:bg-[#1A2235] px-6 py-4 rounded-xl border border-blue-50 dark:border-blue-900/30 w-40 flex-1 sm:flex-none">
              <p className="text-[9px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Yearly Forecast</p>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">$5,142.00</h4>
            </div>
            <div className="bg-[#F0F5FF] dark:bg-[#1A2235] px-6 py-4 rounded-xl border border-blue-50 dark:border-blue-900/30 w-40 flex-1 sm:flex-none">
              <p className="text-[9px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Active Services</p>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">14</h4>
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
            We found <span className="font-bold">2 unused services</span> and <span className="font-bold">1 duplicate charge</span> that could save you <span className="font-bold">$45.00/mo.</span>
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
            <button className="flex items-center px-4 py-2 bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-50 dark:hover:bg-[#202A40] transition-colors">
              <Download className="w-4 h-4 mr-2" /> EXPORT LEDGER
            </button>
            <button className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-blue-500 transition-colors shadow-sm">
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
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {subscriptionsData.map((sub) => {
                const Icon = sub.ratingIcon;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${sub.bg} ${sub.text} flex items-center justify-center font-bold text-sm shrink-0`}>
                        {sub.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{sub.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{sub.plan}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider block w-fit mb-1">{sub.cycle}</span>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Next: {sub.next}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold w-fit ${sub.ratingBg} ${sub.ratingColor}`}>
                        <Icon className="w-3 h-3 mr-1.5 fill-current" /> {sub.rating}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{sub.cost}</p>
                      {sub.subCost && <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{sub.subCost}</p>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F8FAFC] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">Cost By Category</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#0F172A] dark:text-gray-300">
              <div className="w-full h-2 bg-gray-200 dark:bg-[#121212] rounded-full overflow-hidden mr-4"><div className="h-full bg-[#0A3D8B] dark:bg-blue-500 w-[45%] rounded-full"></div></div>
              Entertainment
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[#0F172A] dark:text-gray-300">
              <div className="w-full h-2 bg-gray-200 dark:bg-[#121212] rounded-full overflow-hidden mr-4"><div className="h-full bg-blue-600 dark:bg-gray-400 w-[25%] rounded-full"></div></div>
              Productivity
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-[#0F172A] dark:text-gray-300">
              <div className="w-full h-2 bg-gray-200 dark:bg-[#121212] rounded-full overflow-hidden mr-4"><div className="h-full bg-gray-500 dark:bg-gray-600 w-[15%] rounded-full"></div></div>
              Utilities
            </div>
          </div>
        </div>

        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
          <PiggyBank className="w-6 h-6 text-[#0A3D8B] dark:text-blue-400 mb-3" />
          <p className="text-[10px] font-bold text-gray-500 dark:text-blue-300 uppercase tracking-widest mb-1">Potential Savings</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">$540/yr</h3>
        </div>

        <div className="bg-[#F8FAFC] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-50 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <Calendar className="w-6 h-6 text-[#0A3D8B] dark:text-gray-400 mb-3" />
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Average Daily Cost</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">$14.28</h3>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
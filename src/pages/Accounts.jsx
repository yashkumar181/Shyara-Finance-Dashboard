import React from 'react';
import { RefreshCw, Building2, Wallet, CreditCard } from 'lucide-react';

const Accounts = () => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Accounts & Cards</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Real-time consolidated view of your architectural capital.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-[#0A3D8B] dark:bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-[#082f6b] dark:hover:bg-blue-500 transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Account Reconciliation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-2 uppercase">Net Worth</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">$420,840.00</h3>
        </div>
        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30">
          <p className="text-[10px] font-bold text-gray-500 dark:text-blue-300 tracking-wider mb-2 uppercase">Total Assets</p>
          <h3 className="text-2xl font-bold text-[#0A3D8B] dark:text-blue-400">$485,320.00</h3>
        </div>
        <div className="bg-[#FFF0F0] dark:bg-[#3A1C1C] p-6 rounded-2xl shadow-sm border border-red-50 dark:border-red-900/30 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-500 dark:text-red-300 tracking-wider mb-2 uppercase">Total Liabilities</p>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">-$64,480.00</h3>
          </div>
          <svg className="absolute bottom-0 right-0 w-24 h-12 text-red-200 dark:text-red-900/50" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M0,50 L20,30 L40,40 L60,10 L80,20 L100,0 L100,50 Z" fill="currentColor" opacity="0.3" />
            <path d="M0,50 L20,30 L40,40 L60,10 L80,20 L100,0" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-2 uppercase">Liquidity Ratio</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">7.52</h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
              <span className="px-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Cash & Liquid Accounts</span>
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-56">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">HDFC Salary</h4>
                      <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold tracking-wider">XXXX-9021</p>
                    </div>
                  </div>
                  <span className="bg-orange-100 dark:bg-[#262626] text-orange-700 dark:text-orange-400 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-transparent dark:border-[#262626]">Active</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Available Balance</p>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">$12,450.00</h3>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3]">Monthly Yield: <span className="text-emerald-600 dark:text-emerald-400 font-bold">+3.2%</span></p>
                  <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-400 uppercase tracking-wider hover:underline">DETAILS</button>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between h-56">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-[#262626] flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200">FinTech Wallet</h4>
                      <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold tracking-wider">Linked to UPI</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Wallet Balance</p>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">$2,105.80</h3>
                </div>
                <div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-purple-500 w-[75%] rounded-full"></div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide">75% of monthly limit used</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
              <span className="px-4 text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-center">Credit & Liabilities</span>
              <div className="h-px bg-gray-200 dark:bg-[#262626] flex-1"></div>
            </div>

            <div className="bg-[#212735] dark:bg-[#1A1F2C] p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center text-white h-auto sm:h-40 relative overflow-hidden gap-6 border border-transparent dark:border-[#262626]">
              <div className="absolute right-0 top-0 opacity-10 w-64 h-64 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <CreditCard className="w-full h-full" />
              </div>
              <div className="flex flex-col justify-between h-full z-10 w-full sm:w-auto">
                <div className="flex items-center space-x-3 mb-6 sm:mb-4">
                  <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Axis Privilege CC</h4>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">Visa Infinite • XXXX-4421</p>
                  </div>
                </div>
                <div className="flex space-x-8 sm:space-x-12">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 tracking-widest mb-1 uppercase">Current Due</p>
                    <h3 className="text-xl font-bold text-white">$4,820.00</h3>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 tracking-widest mb-1 uppercase">Credit Limit</p>
                    <h3 className="text-xl font-bold text-white">$25,000.00</h3>
                  </div>
                </div>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 z-10 shrink-0 self-center sm:mr-4">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path className="text-gray-700" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-300" strokeWidth="4" strokeDasharray="19, 100" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="block text-sm font-bold">19%</span>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Used</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-8 rounded-2xl shadow-md text-white relative overflow-hidden h-72 flex flex-col justify-between border border-transparent dark:border-[#262626]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-4 inline-block">Pro Insight</span>
              <h3 className="text-lg font-bold mb-3">Optimize Your Liabilities</h3>
              <p className="text-xs text-blue-100 leading-relaxed opacity-90">
                Your credit utilization is at a healthy 19%. Consider transferring your HDFC balance to yield 0.5% higher APY.
              </p>
            </div>
            <button className="relative z-10 w-full bg-white dark:bg-[#121212] text-[#0A3D8B] dark:text-gray-200 font-bold text-xs py-3 rounded-lg mt-4 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors border border-transparent dark:border-[#262626]">
              Review Strategy
            </button>
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-6">Liability Breakdown</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Housing Loan</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">$48,200</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Credit Cards</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">$12,480</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[20%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Personal Lines</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">$3,800</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-red-800 dark:bg-red-500 w-[10%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Recent Clearing</h2>
          <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-blue-400 uppercase tracking-widest hover:underline">VIEW AUDIT LOG</button>
        </div>
        
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626] bg-gray-100 dark:bg-[#0a0a0a]">
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest w-1/2">Counterparty / Description</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-[#262626] text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">AM</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Amazon Marketplace</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 22, 2023 • 14:22</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">Axis CC (4421)</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 dark:bg-[#262626] text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Settled</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-[#0F172A] dark:text-gray-200">-$124.50</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-[#262626] text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">SC</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Stripe Corporate Payout</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 21, 2023 • 09:00</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">HDFC Salary (9021)</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-50 dark:bg-[#262626] text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Cleared</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">+$4,250.00</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-[#262626] text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">UW</div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Uber Wallet Refill</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-medium">Nov 21, 2023 • 18:45</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">FinTech Wallet</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-50 dark:bg-[#262626] text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-transparent px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">Pending</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-[#0F172A] dark:text-gray-200">-$25.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, TrendingDown, Coins, Activity, ArrowRight, Zap, Target, HeartPulse } from 'lucide-react';

const SmartInsightsWidget = ({ insights }) => {
  const [impulseAmount, setImpulseAmount] = useState('');

  if (!insights) {
    return (
      <div className="mb-8 p-6 bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#262626] flex items-center space-x-4 animate-pulse shadow-sm">
        <BrainCircuit className="w-8 h-8 text-[#0A3D8B] dark:text-blue-500" />
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Initializing Shyara Intelligence...</h2>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Crunching millions of data points across your ledger.</p>
        </div>
      </div>
    );
  }

  // --- Insight 1 & 6: Health Score Variables ---
  const healthScore = insights.healthScore || 0;
  let healthColor = 'text-red-500';
  let healthStroke = 'stroke-red-500';
  if (healthScore >= 75) {
    healthColor = 'text-emerald-500';
    healthStroke = 'stroke-emerald-500';
  } else if (healthScore >= 50) {
    healthColor = 'text-yellow-500';
    healthStroke = 'stroke-yellow-500';
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <BrainCircuit className="w-5 h-5 text-[#0A3D8B] dark:text-blue-400" />
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 tracking-tight">Shyara Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* --- NEW: CASH FLOW HEALTH SCORE --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col md:flex-row items-center gap-8">
          
          {/* Circular Gauge */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-gray-200 dark:stroke-gray-800" strokeWidth="3"></circle>
              {/* Score Track */}
              <circle 
                cx="18" cy="18" r="15.9155" fill="none" 
                className={`${healthStroke} transition-all duration-1000 ease-out`} 
                strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${healthColor}`}>{healthScore}</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Health</span>
            </div>
          </div>

          {/* Sub-Metrics */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Income Stability</span>
              <span className="text-xs font-bold text-gray-500">{insights.incomeStabilityScore || 0}/100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#0A3D8B] dark:bg-blue-500 rounded-full" style={{ width: `${insights.incomeStabilityScore || 0}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Expense Stability</span>
              <span className="text-xs font-bold text-gray-500">{insights.expenseStabilityScore || 0}/100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${insights.expenseStabilityScore || 0}%` }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Account Diversity</span>
              <span className="text-xs font-bold text-gray-500">{insights.accountDiversityScore || 0}/100</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${insights.accountDiversityScore || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Hero Metric: Safe to Spend (Existing) */}
        <div className="xl:col-span-2 bg-gradient-to-r from-[#0A3D8B] to-[#1E3A8A] dark:from-[#1A2235] dark:to-[#121212] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-transparent dark:border-[#262626]">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none">
            <Activity className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4 h-full">
            <div>
              <p className="text-[10px] font-bold text-blue-200 tracking-widest uppercase mb-1 flex items-center"><Zap className="w-3 h-3 mr-1"/> Safe-To-Spend Daily</p>
              <h3 className="text-4xl font-bold">₹{insights.safeToSpendDaily?.toLocaleString('en-IN') || '0'}</h3>
              <p className="text-xs text-blue-100 mt-2 opacity-90 max-w-md">Calculated by reserving ₹{insights.upcomingBills?.toLocaleString('en-IN') || '0'} for upcoming subscriptions before month-end.</p>
            </div>
            
            {/* Impulse Deflector Mini-Tool */}
            <div className="bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm w-full md:w-72 mt-auto">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center"><Target className="w-3 h-3 mr-1"/> Impulse Deflector</p>
              <div className="flex space-x-2">
                <input type="number" placeholder="Cost (₹)" value={impulseAmount} onChange={(e) => setImpulseAmount(e.target.value)} className="w-full bg-white/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-1 focus:ring-white" />
              </div>
              {impulseAmount > 0 && (
                <p className="text-[10px] font-medium text-orange-200 mt-2 leading-tight">
                  This equates to <span className="font-bold">{(impulseAmount / (insights.safeToSpendDaily || 1)).toFixed(0)} days</span> of your safe spend limit.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Lifestyle Creep */}
        {insights.creepPercentage > 5 ? (
          <div className="bg-[#FFF0F0] dark:bg-[#3A1C1C] p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
            <ShieldAlert className="w-5 h-5 text-red-500 mb-3" />
            <h4 className="text-sm font-bold text-red-900 dark:text-red-400 mb-1">Lifestyle Creep Detected</h4>
            <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed">Your 30-day spending is up {insights.creepPercentage}% vs your 90-day baseline.</p>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <Activity className="w-5 h-5 text-emerald-500 mb-3" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-1">Pacing Optimal</h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">Your discretionary burn rate is perfectly stabilized.</p>
          </div>
        )}

        {/* Tax Harvesting */}
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

        {/* Dividend Snowball */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626]">
          <Coins className="w-5 h-5 text-yellow-500 mb-3" />
          <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Dividend Snowball</h4>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">You are pacing to generate <span className="font-bold text-[#0F172A] dark:text-gray-200">₹{insights.annualDividends?.toLocaleString('en-IN') || '0'}</span> in passive income this year.</p>
        </div>

        {/* Portfolio Beta */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626]">
          <Activity className="w-5 h-5 text-purple-500 mb-3" />
          <h4 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-1">Portfolio Beta</h4>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Your risk score is <span className={`font-bold ${parseFloat(insights.portfolioBeta) > 1.2 ? 'text-red-500' : 'text-emerald-500'}`}>{insights.portfolioBeta || '1.0'}</span>. {parseFloat(insights.portfolioBeta) > 1.2 ? 'High volatility detected.' : 'Market stable.'}</p>
        </div>
      </div>
    </div>
  );
};

export default SmartInsightsWidget;
import React, { useState } from 'react';
import { BrainCircuit, ShieldAlert, TrendingDown, Coins, Activity, ArrowRight, Target, AlertTriangle, Calendar, TrendingUp, PieChart } from 'lucide-react';

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Insight 1: Cash Flow Health Score */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-gray-200 dark:stroke-gray-800" strokeWidth="3"></circle>
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

        {/* Insight 4: 30-Day Balance Forecast */}
        <div className={`rounded-2xl p-6 shadow-sm border relative overflow-hidden flex flex-col justify-between ${insights.hitsZero ? 'bg-[#FFF0F0] dark:bg-[#3A1C1C] border-red-100 dark:border-red-900/30' : 'bg-gradient-to-br from-[#F0F5FF] to-[#E0EFFF] dark:from-[#1A2235] dark:to-[#121E36] border-blue-100 dark:border-blue-900/30'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center ${insights.hitsZero ? 'text-red-800 dark:text-red-400' : 'text-[#0A3D8B] dark:text-blue-300'}`}>
                <Calendar className="w-3 h-3 mr-1"/> 30-Day Liquidity Forecast
              </p>
              <h3 className={`text-3xl font-bold ${insights.hitsZero ? 'text-red-900 dark:text-red-300' : 'text-[#0F172A] dark:text-gray-200'}`}>
                ₹{insights.forecast30Days?.[29]?.projected_balance?.toLocaleString('en-IN') || '0'}
              </h3>
              <p className={`text-xs mt-1 ${insights.hitsZero ? 'text-red-700 dark:text-red-400/80' : 'text-gray-500 dark:text-blue-200'}`}>
                Projected balance next month
              </p>
            </div>
            <div className={`p-3 rounded-xl ${insights.hitsZero ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-white/50 dark:bg-[#0a0a0a]/50 text-[#0A3D8B] dark:text-blue-400'}`}>
              {insights.hitsZero ? <AlertTriangle className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
          </div>

          <div className="mt-4">
            {insights.hitsZero ? (
              <div className="bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/30">
                <p className="text-xs font-bold text-red-800 dark:text-red-300">
                  CRITICAL: Liquidity Depletion Risk
                </p>
                <p className="text-[11px] text-red-700 dark:text-red-400/80 mt-1">
                  At your current burn rate of ₹{Math.abs(insights.netDailyVelocity || 0).toLocaleString('en-IN')}/day, you will run out of liquid cash in exactly <span className="font-bold">{insights.daysToZero} days</span>.
                </p>
              </div>
            ) : (
              <div className="bg-white/40 dark:bg-[#0a0a0a]/40 p-3 rounded-lg border border-blue-200/50 dark:border-[#262626]">
                <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">
                  Trajectory Safe
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                  You are generating a net surplus of <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(insights.netDailyVelocity || 0).toLocaleString('en-IN')}/day</span>. Your upcoming liabilities are fully covered.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Insight 9: Z-Score Anomaly Alerts */}
        {insights.anomalies && insights.anomalies.length > 0 ? (
          <div className="xl:col-span-2 bg-[#FFF0F0] dark:bg-[#3A1C1C] p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
            <div className="flex items-center mb-4">
              <ShieldAlert className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="text-sm font-bold text-red-900 dark:text-red-400">Unusual Spending Detected</h4>
            </div>
            <div className="space-y-3">
              {insights.anomalies.map((tx, idx) => (
                <div key={idx} className="bg-white/60 dark:bg-black/20 p-3 rounded-lg flex justify-between items-center border border-red-200/50 dark:border-red-900/20">
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">{tx.merchant}</p>
                    <p className="text-[10px] text-red-700 dark:text-red-400/80 mt-0.5">
                      <span className="font-bold">{tx.multiplier}x higher</span> than your normal average.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="xl:col-span-2 bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center shadow-sm">
            <Activity className="w-8 h-8 text-emerald-500 mr-4 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 mb-1">No Anomalies Detected</h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">All recent transactions fall within normal statistical bounds. No highly unusual spending events found.</p>
            </div>
          </div>
        )}

        {/* Insight 2: Monthly Burn Rate Trend */}
        <div className={`p-5 rounded-2xl border shadow-sm ${insights.burnRateTrend > 5 ? 'bg-[#FFF0F0] dark:bg-[#3A1C1C] border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'}`}>
          {insights.burnRateTrend > 5 ? <TrendingUp className="w-5 h-5 text-red-500 mb-3" /> : <TrendingDown className="w-5 h-5 text-emerald-500 mb-3" />}
          <h4 className={`text-sm font-bold mb-1 ${insights.burnRateTrend > 5 ? 'text-red-900 dark:text-red-400' : 'text-emerald-900 dark:text-emerald-400'}`}>
            {insights.burnRateMessage || "Burn Rate Trend"}
          </h4>
          <p className={`text-xs leading-relaxed ${insights.burnRateTrend > 5 ? 'text-red-800/80 dark:text-red-300/80' : 'text-emerald-800/80 dark:text-emerald-300/80'}`}>
            Your monthly spending is trending <span className="font-bold">{insights.burnRateTrend > 0 ? '+' : ''}{insights.burnRateTrend}%</span> over the last 6 months.
          </p>
        </div>

        {/* Insight 8: Account Concentration Risk */}
        <div className={`p-5 rounded-2xl border shadow-sm ${insights.concentrationRisk ? 'bg-[#FFF0F0] dark:bg-[#3A1C1C] border-red-100 dark:border-red-900/30' : 'bg-[#F8F9FA] dark:bg-[#121212] border-gray-200 dark:border-[#262626]'}`}>
          {insights.concentrationRisk ? <AlertTriangle className="w-5 h-5 text-red-500 mb-3" /> : <PieChart className="w-5 h-5 text-[#0A3D8B] dark:text-blue-400 mb-3" />}
          <h4 className={`text-sm font-bold mb-1 ${insights.concentrationRisk ? 'text-red-900 dark:text-red-400' : 'text-[#0F172A] dark:text-gray-200'}`}>
            {insights.concentrationRisk ? "Concentration Risk" : "Diversified Assets"}
          </h4>
          <p className={`text-xs leading-relaxed ${insights.concentrationRisk ? 'text-red-800/80 dark:text-red-300/80' : 'text-gray-500 dark:text-[#a3a3a3]'}`}>
            <span className="font-bold">{insights.maxConcentration}%</span> of your liquid cash is concentrated in <span className="font-bold">{insights.highestAccountName}</span>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SmartInsightsWidget;

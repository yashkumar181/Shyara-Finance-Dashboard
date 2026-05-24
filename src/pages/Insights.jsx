import React, { useState, useEffect } from 'react';
import { 
  Flame, PlaneTakeoff, Ghost, TrendingDown, AlertTriangle, 
  Download, Activity, Target, RefreshCw, Clock, CheckCircle2, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
const Insights = () => {
  const api = useApi();
  const { 
    dashboard, setDashboard, accounts, setAccounts, 
    subscriptions, setSubscriptions, goals, setGoals,
    preferences, updatePreference, insights 
  } = useAppStore();

  const [isInitializing, setIsInitializing] = useState(!dashboard);
  const [isSilentlyRefreshing, setIsSilentlyRefreshing] = useState(false);
  
  // NEW: State for the Graph Toggle
  const [burnRateView, setBurnRateView] = useState('monthly');

  const [extraSavings, setExtraSavings] = useState(preferences?.fireExtraSavings || 0);
  const [targetAge, setTargetAge] = useState(preferences?.fireTargetAge || 50);
  const currentAge = 28; 

  useEffect(() => {
    updatePreference('fireExtraSavings', extraSavings);
    updatePreference('fireTargetAge', targetAge);
  }, [extraSavings, targetAge, updatePreference]);

  useEffect(() => {
    const fetchInsightsData = async () => {
      if (dashboard) setIsSilentlyRefreshing(true);
      try {
        const dashData = await api.getDashboard().catch(() => null);
        const accData = await api.getAccounts().catch(() => null);
        const subData = await api.getSubscriptions().catch(() => null);
        const goalData = await api.getGoals().catch(() => null);
        
        if (dashData) setDashboard(dashData);
        if (accData) setAccounts(accData);
        if (subData) setSubscriptions(subData);
        if (goalData) setGoals(goalData);
      } catch (error) { console.error("Silent sync failed:", error); } 
      finally { setIsInitializing(false); setIsSilentlyRefreshing(false); }
    };
    fetchInsightsData();
  }, [api, setDashboard, setAccounts, setSubscriptions, setGoals]);

  if (isInitializing) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex items-center space-x-3 text-[#0A3D8B] dark:text-blue-500 font-bold tracking-widest uppercase text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Synchronizing Models...</span>
        </div>
      </div>
    );
  }

  const safeDashboard = dashboard || {};
  const currentNetWorth = safeDashboard.netWorth || 0;
  const monthlySpend = safeDashboard.monthlySpent || 1; 
  const monthlyBudget = safeDashboard.monthlyBudget || 0;

  // F.I.R.E Engine
  const annualSpend = monthlySpend * 12;
  const fireCorpusTarget = annualSpend * 25;
  const baseMonthlySavings = Math.max((monthlyBudget - monthlySpend), 0);
  const totalMonthlySavings = baseMonthlySavings + Number(extraSavings);
  let yearsToFire = 99; 
  if (totalMonthlySavings > 0) yearsToFire = Math.max(0, Math.log((fireCorpusTarget * 0.00833) / totalMonthlySavings + 1) / Math.log(1.00833) / 12);
  const projectedAge = Math.round(currentAge + yearsToFire);
  const isPacingWell = projectedAge <= targetAge;

  // Zero-Income Engine
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const liquidCash = safeAccounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  const runwayMonths = monthlySpend > 0 ? (liquidCash / monthlySpend).toFixed(1) : "99.9";

  // Subscriptions & Debt
  const activeSubs = Array.isArray(subscriptions) ? subscriptions.filter(s => s.status === 'active') : [];
  const totalCCDebt = insights?.totalCCDebt || 0;
  const debtMonths = insights?.debtPayoffMonths || 0;
  const payoffDate = new Date();
  if (debtMonths > 0) payoffDate.setMonth(payoffDate.getMonth() + debtMonths);
  const formattedPayoffDate = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // NEW: Extract Graph Data
  const burnRateData = insights?.burnRateHistory?.[burnRateView] || [];

  return (
    <div className="flex-1 overflow-auto p-4 pb-28 md:p-10 md:pb-10 relative print:p-0 print:bg-white">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Financial Time Machine</h1>
            {isSilentlyRefreshing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Predictive modeling and scenario analysis.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export Insights
        </button>
      </div>

      {/* --- F.I.R.E. ENGINE --- */}
      <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 md:p-10 rounded-2xl shadow-xl text-white mb-8 relative overflow-hidden border border-transparent dark:border-[#262626]">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
          <Flame className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
          <div className="w-full xl:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold tracking-widest uppercase text-blue-200">F.I.R.E. Projection</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Current Net Worth</p>
                <p className="text-sm font-bold">₹{currentNetWorth.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Age {yearsToFire === 99 ? '?' : projectedAge}
            </h3>
            <p className="text-sm text-blue-100 max-w-md leading-relaxed mb-6">
              Based on your target corpus of <span className="font-bold text-white">₹{fireCorpusTarget.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span> and a monthly savings rate of ₹{totalMonthlySavings.toLocaleString('en-IN')}, you will achieve total financial independence in {yearsToFire === 99 ? 'an undetermined amount of' : yearsToFire.toFixed(1)} years.
            </p>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${isPacingWell ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              <Activity className="w-4 h-4 mr-2" /> 
              {totalMonthlySavings <= 0 ? 'Increase savings to generate projection.' : isPacingWell ? 'On track for target retirement.' : 'Falling behind target retirement age.'}
            </div>
          </div>

          <div className="w-full xl:w-1/2 bg-white/10 dark:bg-black/20 p-6 rounded-2xl backdrop-blur-sm shadow-inner border border-white/5">
            <h4 className="text-sm font-bold mb-6 flex items-center"><Target className="w-4 h-4 mr-2" /> Scenario Simulator</h4>
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Extra Monthly Savings</span>
                <span className="text-blue-200">+ ₹{Number(extraSavings).toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="0" max="50000" step="1000" value={extraSavings} onChange={(e) => setExtraSavings(e.target.value)} className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Target Retirement Age</span>
                <span className="text-blue-200">Age {targetAge}</span>
              </div>
              <input type="range" min="35" max="65" step="1" value={targetAge} onChange={(e) => setTargetAge(e.target.value)} className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW: BURN RATE VELOCITY GRAPH --- */}
      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center">
              {insights?.burnRateTrend > 5 ? <TrendingUp className="w-5 h-5 mr-2 text-red-500" /> : <TrendingDown className="w-5 h-5 mr-2 text-emerald-500" />}
              Burn Rate Velocity
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mt-1">
              Your historical expense trajectory. Currently trending <span className={`font-bold ${insights?.burnRateTrend > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{insights?.burnRateTrend > 0 ? '+' : ''}{insights?.burnRateTrend || 0}%</span>.
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-200 dark:bg-[#1a1a1a] p-1 rounded-lg border border-gray-300 dark:border-[#262626]">
            <button 
              onClick={() => setBurnRateView('weekly')} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${burnRateView === 'weekly' ? 'bg-white dark:bg-[#262626] text-[#0A3D8B] dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setBurnRateView('monthly')} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${burnRateView === 'monthly' ? 'bg-white dark:bg-[#262626] text-[#0A3D8B] dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* The Recharts Area */}
        <div className="w-full h-72">
          {burnRateData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burnRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#0A3D8B', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: '1px solid #262626', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Total Spent']}
                  labelStyle={{ color: '#a3a3a3', marginBottom: '4px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" dataKey="value" stroke="#0A3D8B" strokeWidth={3} 
                  dot={{ r: 4, fill: '#0A3D8B', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-xl">
                <p className="text-sm text-gray-400 font-medium">Insufficient data to plot trajectory.</p>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* --- ZERO INCOME RUNWAY --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-2">Zero-Income Runway</h3>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6 leading-relaxed">If all income stopped today, your liquid cash reserves would cover your current burn rate for exactly:</p>
          <div className="flex items-end space-x-2 mb-4">
            <span className={`text-4xl font-bold ${runwayMonths < 3 ? 'text-red-500' : 'text-[#0F172A] dark:text-gray-200'}`}>{runwayMonths}</span>
            <span className="text-sm font-bold text-gray-500 pb-1 uppercase tracking-widest">Months</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${runwayMonths >= 6 ? 'bg-emerald-500' : runwayMonths >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min((runwayMonths / 6) * 100, 100)}%` }}></div>
          </div>
        </div>

        {/* --- INSIGHT 7: DEBT PAYOFF TIMELINE --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-2">Debt Payoff Timeline</h3>
          {totalCCDebt > 0 ? (
            debtMonths > 0 ? (
              <>
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6 leading-relaxed">Based on your recent payment velocity, your <span className="font-bold text-[#0F172A] dark:text-gray-200">₹{totalCCDebt.toLocaleString('en-IN')}</span> in credit liabilities will be completely cleared in:</p>
                <div className="flex items-end space-x-2 mb-4">
                  <span className="text-4xl font-bold text-[#0F172A] dark:text-gray-200">{debtMonths}</span>
                  <span className="text-sm font-bold text-gray-500 pb-1 uppercase tracking-widest">Months</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 rounded-full w-1/3"></div>
                </div>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-2 uppercase tracking-wide">Projected Freedom: {formattedPayoffDate}</p>
              </>
            ) : (
              <div className="bg-[#FFF0F0] dark:bg-[#3A1C1C] border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start space-x-3 mt-4 shadow-sm">
                 <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-red-900 dark:text-red-400">Debt Increasing</p>
                   <p className="text-xs text-red-800/80 mt-1 leading-relaxed">Your recent payments are insufficient to overcome your ₹{totalCCDebt.toLocaleString('en-IN')} debt.</p>
                 </div>
              </div>
            )
          ) : (
             <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">Zero active credit card debt detected. Optimal efficiency achieved.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- INSIGHT 11: GOAL ACHIEVABILITY SCORE --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-1">Goal Achievability</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Surplus velocity: <span className={`font-bold ${insights?.avgMonthlySurplus > 0 ? 'text-emerald-500' : 'text-red-500'}`}>₹{(insights?.avgMonthlySurplus || 0).toLocaleString('en-IN')}/mo</span></p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {insights?.goalProjections?.length > 0 ? (
              insights.goalProjections.map((goal, idx) => {
                let badgeColor = 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30';
                let Icon = AlertTriangle;
                if (goal.status === 'On Track') { badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'; Icon = CheckCircle2; }
                else if (goal.status === 'Challenging') { badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-900/30'; Icon = Clock; }
                return (
                  <div key={idx} className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-100 dark:border-[#262626] shadow-sm flex justify-between items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{goal.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">₹{goal.remaining.toLocaleString('en-IN')} Remaining</p>
                    </div>
                    <div className={`flex items-center px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest border font-bold whitespace-nowrap ${badgeColor}`}>
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {goal.status === 'Unrealistic' ? 'Unrealistic' : `${goal.monthsToTarget} Months`}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-dashed border-gray-200 dark:border-[#262626] text-center">No active goals found.</p>
            )}
          </div>
        </div>

        {/* --- ZOMBIE SUBSCRIPTIONS --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Ghost className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-1">Zombie Subscriptions</h3>
              {activeSubs.length > 4 ? (
                <p className="text-xs text-gray-500 leading-relaxed mt-2">You are maintaining {activeSubs.length} active subscriptions. Algorithms suggest a high probability of overlap. Canceling the bottom 2 could accelerate your goals by 4%.</p>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed mt-2">Subscription payload is highly optimized. No wasted or duplicate recurring charges detected.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Insights;
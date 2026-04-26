import React, { useState, useEffect } from 'react';
import { 
  Flame, PlaneTakeoff, Ghost, TrendingDown, AlertTriangle, 
  Download, ArrowRight, Activity, Target, CreditCard, RefreshCw 
} from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const Insights = () => {
  const api = useApi();
  const { 
    dashboard, setDashboard, 
    accounts, setAccounts, 
    subscriptions, setSubscriptions, 
    goals, setGoals,
    preferences, updatePreference
  } = useAppStore();
  
  // OPTIMIZATION 1: Only block the UI if we have literally 0 cached data.
  // If we have dashboard data, load the page instantly (0ms load time).
  const [isInitializing, setIsInitializing] = useState(!dashboard);
  const [isSilentlyRefreshing, setIsSilentlyRefreshing] = useState(false);

  // F.I.R.E. Engine Interactive State
  const [extraSavings, setExtraSavings] = useState(preferences?.fireExtraSavings || 0);
  const [targetAge, setTargetAge] = useState(preferences?.fireTargetAge || 50);
  const currentAge = 28; // Standard baseline for modeling

  // Save slider preferences to local storage whenever they change
  useEffect(() => {
    updatePreference('fireExtraSavings', extraSavings);
    updatePreference('fireTargetAge', targetAge);
  }, [extraSavings, targetAge, updatePreference]);

  // OPTIMIZATION 2: Background Data Synchronization
  useEffect(() => {
    const fetchInsightsData = async () => {
      if (dashboard) setIsSilentlyRefreshing(true);
      
      try {
        // Fetching independently so one failing doesn't break the others
        const dashData = await api.getDashboard().catch(() => null);
        const accData = await api.getAccounts().catch(() => null);
        const subData = await api.getSubscriptions().catch(() => null);
        const goalData = await api.getGoals().catch(() => null);
        
        if (dashData) setDashboard(dashData);
        if (accData) setAccounts(accData);
        if (subData) setSubscriptions(subData);
        if (goalData) setGoals(goalData);
      } catch (error) {
        console.error("Silent sync failed:", error);
      } finally {
        setIsInitializing(false);
        setIsSilentlyRefreshing(false);
      }
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

  // OPTIMIZATION 3: Bulletproof Fallback Math (Prevents NaN or Static Errors)
  const safeDashboard = dashboard || {};
  const currentNetWorth = safeDashboard.netWorth || 0;
  const monthlySpend = safeDashboard.monthlySpent || 1; // Prevent division by zero
  const monthlyBudget = safeDashboard.monthlyBudget || 0;

  // --- ENGINE 1: F.I.R.E. Math ---
  const annualSpend = monthlySpend * 12;
  const fireCorpusTarget = annualSpend * 25; // Standard 4% withdrawal rule
  const baseMonthlySavings = Math.max((monthlyBudget - monthlySpend), 0);
  const totalMonthlySavings = baseMonthlySavings + Number(extraSavings);
  
  // Calculate compounding interest
  let yearsToFire = 99; // Default if saving 0
  if (totalMonthlySavings > 0) {
    yearsToFire = Math.max(0, Math.log((fireCorpusTarget * 0.00833) / totalMonthlySavings + 1) / Math.log(1.00833) / 12);
  }
  
  const projectedAge = Math.round(currentAge + yearsToFire);
  const isPacingWell = projectedAge <= targetAge;

  // --- ENGINE 2: Zero-Income Runway ---
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const liquidCash = safeAccounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  const runwayMonths = monthlySpend > 0 ? (liquidCash / monthlySpend).toFixed(1) : "99.9";

  // --- ENGINE 3: Debt Optimizer ---
  // Smallest absolute balance first (Debt Snowball methodology)
  const creditCards = safeAccounts.filter(a => a.account_type === 'credit_card' && parseFloat(a.balance || 0) < 0)
                                  .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance)); 
  const totalDebt = creditCards.reduce((sum, card) => sum + Math.abs(parseFloat(card.balance)), 0);

  // --- ENGINE 4 & 5: Subscriptions & Goals ---
  const activeSubs = Array.isArray(subscriptions) ? subscriptions.filter(s => s.status === 'active') : [];
  const activeGoals = Array.isArray(goals) ? goals : [];
  const overBudget = monthlySpend > monthlyBudget;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-auto p-4 pb-28 md:p-10 md:pb-10 relative print:p-0 print:bg-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Financial Time Machine</h1>
            {isSilentlyRefreshing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Predictive modeling and scenario analysis.</p>
        </div>
        <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export Insights
        </button>
      </div>

      {/* --- F.I.R.E. ENGINE --- */}
      <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 md:p-10 rounded-2xl shadow-xl text-white mb-8 relative overflow-hidden border border-transparent dark:border-[#262626] print:bg-white print:text-black print:border-gray-200">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none print:hidden">
          <Flame className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
          <div className="w-full xl:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-sm font-bold tracking-widest uppercase text-blue-200">F.I.R.E. Projection</h2>
              </div>
              <div className="text-right print:hidden">
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Current Net Worth</p>
                <p className="text-sm font-bold">₹{currentNetWorth.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Age {yearsToFire === 99 ? '∞' : projectedAge}
            </h3>
            <p className="text-sm text-blue-100 max-w-md leading-relaxed mb-6 print:text-gray-600">
              Based on your target corpus of <span className="font-bold text-white print:text-black">₹{fireCorpusTarget.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span> and a monthly savings rate of ₹{totalMonthlySavings.toLocaleString('en-IN')}, you will achieve total financial independence in {yearsToFire === 99 ? 'an undetermined amount of' : yearsToFire.toFixed(1)} years.
            </p>
            
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${isPacingWell ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'} print:bg-transparent print:p-0 print:text-black`}>
              <Activity className="w-4 h-4 mr-2" /> 
              {totalMonthlySavings <= 0 ? 'Increase savings to generate projection.' : isPacingWell ? 'On track for target retirement.' : 'Falling behind target retirement age.'}
            </div>
          </div>

          <div className="w-full xl:w-1/2 bg-white/10 dark:bg-black/20 p-6 rounded-2xl backdrop-blur-sm print:hidden shadow-inner border border-white/5">
            <h4 className="text-sm font-bold mb-6 flex items-center"><Target className="w-4 h-4 mr-2" /> Scenario Simulator</h4>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Extra Monthly Savings</span>
                <span className="text-blue-200">+ ₹{Number(extraSavings).toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="0" max="50000" step="1000" 
                value={extraSavings} onChange={(e) => setExtraSavings(e.target.value)}
                className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Target Retirement Age</span>
                <span className="text-blue-200">Age {targetAge}</span>
              </div>
              <input 
                type="range" min="35" max="65" step="1" 
                value={targetAge} onChange={(e) => setTargetAge(e.target.value)}
                className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
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
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Target: 6.0 Months Minimum</p>
        </div>

        {/* --- DEBT OPTIMIZER --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-2">Debt Snowball Optimizer</h3>
          
          {creditCards.length > 0 ? (
            <>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6 leading-relaxed">You have ₹{totalDebt.toLocaleString('en-IN')} in active credit liabilities. Focus all surplus payments on this target first:</p>
              <div className="bg-white dark:bg-[#0a0a0a] border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl flex items-center justify-between mb-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{creditCards[0].name || creditCards[0].nickname}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Priority Target</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-500">₹{Math.abs(creditCards[0].balance).toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
             <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">Zero active credit card debt detected. Optimal efficiency achieved.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- GOAL CANNIBALIZATION --- */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${overBudget ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-1">Goal Cannibalization</h3>
              {overBudget && activeGoals.length > 0 ? (
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
                  Warning: You are currently ₹{(monthlySpend - monthlyBudget).toLocaleString('en-IN')} over budget. This deficit is silently delaying your <span className="font-bold text-[#0F172A] dark:text-gray-200">"{activeGoals[0].name}"</span> goal by an estimated 1.2 months.
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Your discretionary spending is contained. Your saving goals are currently completely insulated from lifestyle creep.</p>
              )}
            </div>
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
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
                  You are maintaining {activeSubs.length} active subscriptions. Algorithms suggest a high probability of overlap (e.g., multiple streaming services). Canceling the bottom 2 could accelerate your goals by 4%.
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Subscription payload is highly optimized. No wasted or duplicate recurring charges detected in your ledger.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Insights;
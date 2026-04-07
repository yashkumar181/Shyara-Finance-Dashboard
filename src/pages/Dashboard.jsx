import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, PiggyBank, TrendingUp, Home, GraduationCap, Plus, Laptop, ShoppingCart, Tv, Target } from 'lucide-react';
import LineChart from '../components/charts/LineChart';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const iconMap = { Laptop, Home, ShoppingCart, Tv, CreditCard, GraduationCap, Target, TrendingUp };

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [chartTimeframe, setChartTimeframe] = useState('weekly');
  const navigate = useNavigate();

  const api = useApi();
  const { dashboard, dashboardLoading, setDashboard, setDashboardLoading } = useAppStore();

  useEffect(() => {
    const loadDashboard = async () => {
      setDashboardLoading(true);
      try {
        const data = await api.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    loadDashboard();
  }, [api, setDashboard, setDashboardLoading]);

  if (dashboardLoading || !dashboard) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse text-gray-400 dark:text-[#a3a3a3] font-bold tracking-widest uppercase text-sm">
          Syncing Live Ledger...
        </div>
      </div>
    );
  }

  const surplus = dashboard.monthlyBudget - dashboard.monthlySpent;
  const savingsRate = 100 - dashboard.spendingPercentage;

  const metricsData = {
    monthly: {
      netWorth: `₹${dashboard.netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, nwChange: 'Live', nwClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      cashFlow: `₹${dashboard.bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, cfChange: 'Active', cfClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', cfDesc: `Credit Debt: ₹${dashboard.creditDebt.toLocaleString('en-IN')}`,
      surplus: `₹${surplus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, surChange: surplus >= 0 ? 'Surplus' : 'Deficit', surClass: surplus >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', surDesc: `Of ₹${dashboard.monthlyBudget.toLocaleString('en-IN')} Budget`,
      savings: `${Math.max(savingsRate, 0).toFixed(1)}%`, savDesc: 'Derived from spending velocity'
    },
    quarterly: {
      netWorth: `₹${(dashboard.netWorth * 1.04).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, nwChange: '+4.0%', nwClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      cashFlow: `₹${(dashboard.bankBalance * 2.8).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, cfChange: 'Projected', cfClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', cfDesc: 'Estimated Q3 Liquidity',
      surplus: `₹${(surplus * 3).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, surChange: 'Forecast', surClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', surDesc: 'Rolling 90-day surplus',
      savings: `${(Math.max(savingsRate, 0) + 1.2).toFixed(1)}%`, savDesc: 'Quarterly average estimate'
    },
    annual: {
      netWorth: `₹${(dashboard.netWorth * 1.12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, nwChange: '+12.0%', nwClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      cashFlow: `₹${(dashboard.bankBalance * 11).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, cfChange: 'Projected', cfClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', cfDesc: 'Estimated FY Liquidity',
      surplus: `₹${(surplus * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, surChange: 'Forecast', surClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', surDesc: 'Annualized surplus',
      savings: `${(Math.max(savingsRate, 0) + 2.5).toFixed(1)}%`, savDesc: 'Annual target trajectory'
    }
  };

  const currentMetrics = metricsData[activeTab];
  const dynamicChartData = dashboard.charts?.[chartTimeframe] || [];

  return (
    <div className="p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Your Financial Overview</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Live metrics synchronized securely.</p>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-lg p-1 flex shadow-sm border border-gray-200 dark:border-[#262626] overflow-x-auto">
          {['monthly', 'quarterly', 'annual'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-md ${activeTab === tab ? 'bg-white dark:bg-[#262626] text-[#0A3D8B] dark:text-gray-200' : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-gray-300'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {/* ALL 4 METRIC CARDS RESTORED HERE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Net Worth Card */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><Wallet className="w-5 h-5" /></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${currentMetrics.nwClass}`}>{currentMetrics.nwChange}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Net Worth</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-4">{currentMetrics.netWorth}</h3>
          <div className="w-16 h-1 bg-[#0A3D8B] dark:bg-gray-400 rounded-full"></div>
        </div>

        {/* Bank Balance Card */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><CreditCard className="w-5 h-5" /></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${currentMetrics.cfClass}`}>{currentMetrics.cfChange}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Bank Balance</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">{currentMetrics.cashFlow}</h3>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3] uppercase">{currentMetrics.cfDesc}</p>
        </div>

        {/* Discretionary Remaining Card */}
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#262626] flex items-center justify-center text-blue-600 dark:text-gray-300 shrink-0"><PiggyBank className="w-5 h-5" /></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${currentMetrics.surClass}`}>{currentMetrics.surChange}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Discretionary Remaining</p>
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-2">{currentMetrics.surplus}</h3>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-[#a3a3a3]">{currentMetrics.surDesc}</p>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-[#0A3D8B] dark:bg-gray-800 p-6 rounded-2xl shadow-md text-white border dark:border-[#262626] transition-all">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-8 shrink-0"><TrendingUp className="w-5 h-5 text-white" /></div>
          <p className="text-[10px] font-bold text-blue-200 dark:text-[#a3a3a3] tracking-wider mb-1 uppercase">Savings Rate</p>
          <h3 className="text-4xl font-bold mb-4">{currentMetrics.savings}</h3>
          <p className="text-[9px] font-semibold text-blue-200 dark:text-[#a3a3a3] uppercase tracking-wide">{currentMetrics.savDesc}</p>
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
            <LineChart data={dynamicChartData} />
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base mb-1">Allocation Waterfall</h3>
            <p className="text-xs text-gray-400 dark:text-[#a3a3a3] mb-8">Distinction between total budget and actual variable spend</p>
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wide">
                <span className="text-[#0F172A] dark:text-gray-200">Total Budget</span>
                <span className="text-[#0F172A] dark:text-gray-200">₹{dashboard.monthlyBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#0A3D8B] dark:bg-blue-500 w-full rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide mb-1">Total Spent</div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 dark:text-[#a3a3a3] uppercase">Current Month</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹{dashboard.monthlySpent.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 dark:bg-rose-500 rounded-full" style={{ width: `${Math.min(dashboard.spendingPercentage, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wide mb-1">Residual Surplus</div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-gray-400 uppercase">Available to Save</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">₹{surplus.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0A3D8B] dark:bg-emerald-500 rounded-full" style={{ width: `${Math.max(savingsRate, 0)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-1/3 space-y-6">
          
          {/* LIVE GOALS SECTION */}
          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base">Strategic Goals</h3>
              <button onClick={() => navigate('/goals')} className="w-6 h-6 rounded-full bg-[#0A3D8B] dark:bg-[#262626] text-white flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /></button>
            </div>
            
            {dashboard.goals && dashboard.goals.length > 0 ? (
              <div className="space-y-6">
                {dashboard.goals.map((goal) => {
                  const Icon = iconMap[goal.icon] || Target;
                  // Handle dynamic theme colors
                  const iconColor = goal.theme === 'rose' ? 'text-rose-600' : 'text-[#0A3D8B]';
                  const barColor = goal.theme === 'rose' ? 'bg-rose-600 dark:bg-rose-500' : 'bg-[#0A3D8B] dark:bg-blue-500';

                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Icon className={`w-4 h-4 ${iconColor} dark:text-gray-400 mr-3 shrink-0`} />
                          <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{goal.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-500 dark:text-[#a3a3a3]">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${goal.progress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-semibold">
                        ₹{goal.current.toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">No active goals found.</p>
            )}
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
            <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base mb-6">Primary Merchants</h3>
            <div className="space-y-6">
              {dashboard.topMerchants?.length > 0 ? dashboard.topMerchants.map((merchant) => (
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
              )) : (
                <p className="text-sm text-gray-500">Not enough spending data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-200 dark:border-[#262626] gap-4">
          <h3 className="text-[#0F172A] dark:text-gray-200 font-semibold text-base">Recent Transactional History</h3>
          <button onClick={() => navigate('/transactions')} className="text-xs font-bold text-[#0A3D8B] dark:text-gray-400 hover:underline cursor-pointer">View All</button>
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
              {dashboard.transactions.slice(0, 5).map((tx) => {
                const Icon = iconMap[tx.icon] || ShoppingCart;
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-[#a3a3a3] font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gray-200 dark:bg-[#262626] text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[#0F172A] dark:text-gray-200">{tx.name || tx.merchant}</span>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-[#0a0a0a] text-gray-600 dark:text-[#a3a3a3] text-[9px] font-bold rounded uppercase">{tx.category}</span></td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0F172A] dark:text-gray-200'}`}>
                        {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50`}>Cleared</span>
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
import React from 'react';
import { NavLink } from 'react-router-dom';
// ADD Lightbulb to your lucide-react imports
import { LayoutDashboard, Landmark, ReceiptText, PlaySquare, Target, Settings, Plus, HelpCircle, LineChart, Download, PieChart, Lightbulb } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import TransactionSheet from './TransactionSheet';
import myLogo from '../assets/logo.jpg';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const openTransactionSheet = useAppStore(state => state.openTransactionSheet);
  const isTransactionSheetOpen = useAppStore(state => state.isTransactionSheetOpen);
  const closeTransactionSheet = useAppStore(state => state.closeTransactionSheet);
  const user = useAppStore(state => state.user);
  
  const { dashboard, transactions, accounts, budget, subscriptions, investments, preferences } = useAppStore(state => state);

  const navLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center px-4 py-3 rounded-lg font-medium text-xs tracking-wide border-l-4 transition-all duration-200 w-full text-left ";
    return isActive
      ? baseClass + "bg-blue-50 dark:bg-[#121212] text-[#0A3D8B] dark:text-gray-100 border-[#0A3D8B] dark:border-gray-500"
      : baseClass + "text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#121212] border-transparent";
  };

  const handleExportLiveState = () => {
    // Keep your existing export logic
    const exportPayload = { timestamp: new Date().toISOString(), user, dashboard, transactions, accounts, budget, subscriptions, investments };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `shyara_live_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#F8F9FA] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#262626] transform transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div>
          <div className="h-16 md:h-20 flex items-center px-6">
            <img src={myLogo} alt="My Logo" className="h-10 w-auto mr-3 object-contain rounded-md" />
            <div>
              <h1 className="text-[#0F172A] dark:text-gray-200 font-bold text-sm tracking-wide transition-colors">Shyara Finance</h1>
              <p className="text-gray-400 dark:text-[#a3a3a3] text-[10px] tracking-widest uppercase">Personal Dashboard</p>
            </div>
          </div>
          
          <nav className="mt-4 space-y-1 px-4 overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-none">
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={navLinkClass}><LayoutDashboard className="w-4 h-4 mr-3 shrink-0" /> DASHBOARD</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/accounts" className={navLinkClass}><Landmark className="w-4 h-4 mr-3 shrink-0" /> ACCOUNTS</NavLink>
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/transactions" className={navLinkClass}><ReceiptText className="w-4 h-4 mr-3 shrink-0" /> TRANSACTIONS</NavLink>
            
            {/* --- ADD NEW INSIGHTS LINK HERE --- */}
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/insights" className={navLinkClass}><Lightbulb className="w-4 h-4 mr-3 shrink-0" /> INSIGHTS</NavLink>

            {preferences?.showSubscriptions !== false && (
              <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/subscriptions" className={navLinkClass}><PlaySquare className="w-4 h-4 mr-3 shrink-0" /> SUBSCRIPTIONS</NavLink>
            )}
            
            {preferences?.showInvestments !== false && (
              <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/investments" className={navLinkClass}><LineChart className="w-4 h-4 mr-3 shrink-0" /> INVESTMENTS</NavLink>
            )}
            
            {preferences?.showBudget !== false && (
              <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/budget" className={navLinkClass}><PieChart className="w-4 h-4 mr-3 shrink-0" /> BUDGET</NavLink>
            )}
            
            {preferences?.showGoals !== false && (
              <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/goals" className={navLinkClass}><Target className="w-4 h-4 mr-3 shrink-0" /> GOALS</NavLink>
            )}
            
            <NavLink onClick={() => setIsMobileMenuOpen(false)} to="/settings" className={navLinkClass}><Settings className="w-4 h-4 mr-3 shrink-0" /> SETTINGS</NavLink>
          </nav>
          
          <div className="px-6 mt-8 space-y-3">
            <button onClick={() => { openTransactionSheet(); setIsMobileMenuOpen(false); }} className="w-full bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white flex items-center justify-center py-3 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-md">
              <Plus className="w-4 h-4 mr-2" /> NEW TRANSACTION
            </button>
            <button onClick={handleExportLiveState} className="w-full bg-white dark:bg-[#121212] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] text-[#0F172A] dark:text-gray-200 border border-gray-200 dark:border-[#262626] flex items-center justify-center py-3 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm">
              <Download className="w-4 h-4 mr-2 text-gray-500 dark:text-[#a3a3a3]" /> EXPORT DATA
            </button>
          </div>
        </div>
        
        <div className="p-6 hidden md:block">
          <button className="flex items-center text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-gray-200 text-xs font-medium tracking-wide w-full transition-colors">
            <HelpCircle className="w-4 h-4 mr-3" /> HELP CENTER
          </button>
        </div>
      </div>

      <TransactionSheet isOpen={isTransactionSheetOpen} onClose={closeTransactionSheet} />
    </>
  );
};

export default Sidebar;
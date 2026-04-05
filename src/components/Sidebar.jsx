import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Landmark, ReceiptText, PlaySquare, Target, Settings, Plus, HelpCircle, LineChart } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import AddTransactionModal from './AddTransactionModal';

const Sidebar = () => {
  const { role } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center px-4 py-3 rounded-lg font-medium text-xs tracking-wide border-l-4 transition-all duration-200 w-full text-left ";
    return isActive
      ? baseClass + "bg-blue-50 dark:bg-[#121212] text-[#0A3D8B] dark:text-gray-100 border-[#0A3D8B] dark:border-gray-500"
      : baseClass + "text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-100 dark:hover:bg-[#121212] border-transparent";
  };

  return (
    <>
      {/* Completely hidden on mobile, fixed width on desktop */}
      <div className="hidden md:flex flex-col justify-between w-64 bg-[#F8F9FA] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#262626] shrink-0 transition-colors duration-300">
        
        <div>
          <div className="h-20 flex items-center px-6">
            <div className="bg-[#0F172A] dark:bg-gray-200 w-8 h-8 rounded flex items-center justify-center mr-3 shrink-0 shadow-inner">
              <div className="w-3 h-3 border-2 border-blue-400 dark:border-[#121212] rounded-sm transform rotate-45 transition-colors"></div>
            </div>
            <div>
              <h1 className="text-[#0F172A] dark:text-gray-200 font-bold text-sm tracking-wide transition-colors">Fiscal Clarity</h1>
              <p className="text-gray-400 dark:text-[#a3a3a3] text-[10px] tracking-widest uppercase">The Precision Curator</p>
            </div>
          </div>
          
          <nav className="mt-4 space-y-1 px-4">
            <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="w-4 h-4 mr-3 shrink-0" /> DASHBOARD</NavLink>
            <NavLink to="/accounts" className={navLinkClass}><Landmark className="w-4 h-4 mr-3 shrink-0" /> ACCOUNTS</NavLink>
            <NavLink to="/transactions" className={navLinkClass}><ReceiptText className="w-4 h-4 mr-3 shrink-0" /> TRANSACTIONS</NavLink>
            <NavLink to="/subscriptions" className={navLinkClass}><PlaySquare className="w-4 h-4 mr-3 shrink-0" /> SUBSCRIPTIONS</NavLink>
            <NavLink to="/investments" className={navLinkClass}><LineChart className="w-4 h-4 mr-3 shrink-0" /> INVESTMENTS</NavLink>
            <NavLink to="/goals" className={navLinkClass}><Target className="w-4 h-4 mr-3 shrink-0" /> GOALS</NavLink>
            <NavLink to="/settings" className={navLinkClass}><Settings className="w-4 h-4 mr-3 shrink-0" /> SETTINGS</NavLink>
          </nav>
          
          {role === 'Admin' && (
            <div className="px-6 mt-8">
              <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#0A3D8B] dark:bg-gray-800 hover:bg-[#082f6b] dark:hover:bg-gray-700 text-white flex items-center justify-center py-3 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-md">
                <Plus className="w-4 h-4 mr-2" /> NEW TRANSACTION
              </button>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <button className="flex items-center text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-gray-200 text-xs font-medium tracking-wide w-full transition-colors">
            <HelpCircle className="w-4 h-4 mr-3" /> HELP CENTER
          </button>
        </div>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Sidebar;
import React from 'react';
import { PenLine, Target, Banknote, Plus, Landmark, CreditCard, Wallet, Bot, Users, Settings as CogIcon, Download, History, Trash2 } from 'lucide-react';

const Settings = () => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-10">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Architect your financial environment and data privacy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <div className="lg:col-span-2 bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center mb-1">
                <Users className="w-5 h-5 mr-2 text-[#0A3D8B] dark:text-gray-400" />
                Profile
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Manage your identity and tax compliance details.</p>
            </div>
            <button className="text-xs font-bold text-[#0A3D8B] dark:text-gray-400 flex items-center hover:underline">
              Edit Profile <PenLine className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">Elena Khasanov</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">PAN Number</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">ABCDE1234F</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">elena.k@shyara.io</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-gray-200">+91 98765 43210</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626]">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 flex items-center mb-1">
            <CogIcon className="w-5 h-5 mr-2 text-[#0A3D8B] dark:text-gray-400" />
            App Preferences
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-6">Customize your dashboard workspace.</p>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm">
              <div className="flex items-center text-sm font-bold text-[#0F172A] dark:text-gray-200">
                <Target className="w-4 h-4 mr-3 text-gray-500 dark:text-[#a3a3a3]" /> Goals Module
              </div>
              <div className="w-8 h-4 bg-[#0A3D8B] dark:bg-gray-500 rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm">
              <div className="flex items-center text-sm font-bold text-[#0F172A] dark:text-gray-200">
                <Banknote className="w-4 h-4 mr-3 text-gray-500 dark:text-[#a3a3a3]" /> Loans Tracker
              </div>
              <div className="w-8 h-4 bg-[#0A3D8B] dark:bg-gray-500 rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Accounts & Cards</h2>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Manage linked financial institutions and physical assets.</p>
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-[#0A3D8B] dark:bg-gray-700 text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-gray-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0A3D8B] dark:bg-[#1A2235] p-6 rounded-2xl shadow-md text-white flex flex-col justify-between h-48 border border-transparent dark:border-[#262626]">
            <div className="flex justify-between items-start">
              <Landmark className="w-6 h-6 text-white" />
              <span className="bg-white/20 text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest">Primary</span>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 dark:text-gray-400 mb-1">HDFC Corporate Account</p>
              <h3 className="text-lg font-bold tracking-wider mb-4">XXXX XXXX 4920</h3>
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-blue-200 dark:text-gray-400">Expires 09/27</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">Active</p>
              </div>
            </div>
          </div>

          <button className="bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-2xl p-6 flex flex-col items-center justify-center h-48 hover:bg-gray-50 dark:hover:bg-[#121212] transition-colors">
            <CreditCard className="w-8 h-8 text-gray-400 dark:text-[#a3a3a3] mb-3" />
            <span className="text-xs font-bold text-gray-500 dark:text-[#a3a3a3]">Link Credit Card</span>
          </button>

          <div className="bg-[#F0F5FF] dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-blue-50 dark:border-[#262626] flex flex-col justify-between h-48">
            <Wallet className="w-6 h-6 text-[#0A3D8B] dark:text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] mb-1">Apple Pay Wallet</p>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-4">4 Entities Linked</h3>
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3]">Syncing 2m ago</p>
                <button className="text-[10px] font-bold text-[#0A3D8B] dark:text-gray-400 uppercase tracking-widest hover:underline">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col justify-between">
          <div className="flex items-start space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-[#262626] flex items-center justify-center text-green-600 dark:text-gray-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">WhatsApp Bot</h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Transact via secure automated messaging.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Default Source Account</p>
              <select className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 text-xs font-bold rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-[#0A3D8B] dark:focus:border-gray-500">
                <option>HDFC Corporate Account (4920)</option>
              </select>
            </div>
            <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Confirmation Mode</p>
                <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3]">Ask for OTP for every WhatsApp transaction</p>
              </div>
              <div className="w-8 h-4 bg-[#0A3D8B] dark:bg-gray-500 rounded-full relative cursor-pointer shrink-0">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F0F5FF] dark:bg-[#1A2235] p-8 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30 flex flex-col justify-between">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-[#262626] flex items-center justify-center text-[#0A3D8B] dark:text-gray-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Family Setup</h2>
              <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Share expenses and premium features.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white dark:bg-[#1E1E1E] p-3 rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src="https://ui-avatars.com/api/?name=Mark+Khasanov&background=121212&color=991B1B" alt="Mark" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-gray-200">Mark Khasanov</p>
                  <p className="text-[9px] text-gray-500 dark:text-[#a3a3a3]">Joint Member</p>
                </div>
              </div>
              <CogIcon className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3] cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
            </div>

            <button className="w-full bg-transparent border border-dashed border-[#0A3D8B] dark:border-gray-500 text-[#0A3D8B] dark:text-gray-400 rounded-xl py-3 text-xs font-bold hover:bg-blue-50 dark:hover:bg-[#202A40] transition-colors">
              + Invite Family Member
            </button>
            
            <p className="text-[8px] font-bold text-[#0A3D8B] dark:text-gray-500 tracking-widest uppercase text-center mt-4">
              Premium Subscription Shared (3/5 slots used)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="max-w-md">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200 mb-1">Data Governance</h2>
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">Control your financial footprint. Download your entire history or selectively purge sensitive data records.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" /> Export Ledger
          </button>
          <button className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm whitespace-nowrap">
            <History className="w-4 h-4 mr-2" /> Audit Trail
          </button>
          <button className="flex items-center justify-center px-4 py-2.5 bg-[#FFEFEA] dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/40 border border-transparent dark:border-red-900/30 transition-colors shadow-sm whitespace-nowrap">
            <Trash2 className="w-4 h-4 mr-2" /> Purge Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
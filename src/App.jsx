import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Investments from './pages/Investments';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import { FinanceProvider } from './context/FinanceContext';
import Insights from './pages/Insights';
import Budget from './pages/Budget';
import AuthGuard from './components/AuthGuard'; 

function App() {
  return (
    <FinanceProvider>
      <AuthGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="investments" element={<Investments />} />
              <Route path="goals" element={<Goals />} />
              <Route path="settings" element={<Settings />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="budget" element={<Budget />} />
              
              <Route path="*" element={
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 dark:text-slate-500 font-medium tracking-wide">Page under construction...</p>
                </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthGuard>
    </FinanceProvider>
  );
}

export default App;
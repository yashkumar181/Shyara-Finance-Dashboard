import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialTransactions } from '../data/mockData';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [role, setRole] = useState('Admin'); 
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('financial_dashboard_txs');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem('financial_dashboard_txs', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <FinanceContext.Provider value={{ role, setRole, transactions, addTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
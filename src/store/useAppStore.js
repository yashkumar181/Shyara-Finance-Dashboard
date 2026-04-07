import { create } from "zustand";
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      isTransactionSheetOpen: false,
      openTransactionSheet: () => set({ isTransactionSheetOpen: true }),
      closeTransactionSheet: () => set({ isTransactionSheetOpen: false }),

      user: null,
      userLoading: false,
      setUser: (u) => set({ user: u }),

      dashboard: null,
      dashboardLoading: false,
      dashboardError: null,
      setDashboard: (d) => set({
          dashboard: d,
          currentNetWorth: d?.netWorth || 0,
          monthlyBudget: d?.monthlyBudget || 0,
          monthlySpent: d?.monthlySpent || 0,
      }),
      setDashboardLoading: (v) => set({ dashboardLoading: v }),
      setDashboardError: (e) => set({ dashboardError: e }),

      accounts: [],
      accountsLoading: false,
      setAccounts: (a) => set({ accounts: a }),
      setAccountsLoading: (v) => set({ accountsLoading: v }),

      transactions: [],
      transactionsLoading: false,
      setTransactions: (t) => set({ transactions: t }),
      setTransactionsLoading: (v) => set({ transactionsLoading: v }),

      subscriptions: null,
      subscriptionsLoading: false,
      setSubscriptions: (s) => set({ subscriptions: s }),
      setSubscriptionsLoading: (v) => set({ subscriptionsLoading: v }),

      budget: null,
      budgetLoading: false,
      setBudget: (b) => set({ budget: b }),
      setBudgetLoading: (v) => set({ budgetLoading: v }),

      investments: null,
      investmentsLoading: false,
      setInvestments: (i) => set({ investments: i }),
      setInvestmentsLoading: (v) => set({ investmentsLoading: v }),

      // --- ADDED GOALS STATE ---
      goals: null, 
      goalsLoading: false,
      setGoals: (g) => set({ goals: g }),
      setGoalsLoading: (v) => set({ goalsLoading: v }),

      currentNetWorth: 0,
      monthlyBudget: 0,
      monthlySpent: 0,
    }),
    {
      name: 'shyara-wealth-engine-cache',
      partialize: (state) => ({
        user: state.user,
        dashboard: state.dashboard,
        accounts: state.accounts,
        transactions: state.transactions,
        subscriptions: state.subscriptions,
        budget: state.budget,
        investments: state.investments,
        goals: state.goals, // <-- Added goals here!
        currentNetWorth: state.currentNetWorth,
        monthlyBudget: state.monthlyBudget,
        monthlySpent: state.monthlySpent,
      }),
    }
  )
);
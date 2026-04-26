import { create } from "zustand";
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // --- PREFERENCES STATE ---
      preferences: {
        showInvestments: true,
        showGoals: true,
        showBudget: true,
        showSubscriptions: true,
        whatsappOtp: true
      },
      updatePreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
      })),

      // --- UI STATE ---
      isTransactionSheetOpen: false,
      openTransactionSheet: () => set({ isTransactionSheetOpen: true }),
      closeTransactionSheet: () => set({ isTransactionSheetOpen: false }),

      // --- USER STATE ---
      user: null,
      userLoading: false,
      setUser: (u) => set({ user: u }),

      // --- DASHBOARD STATE ---
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

      // --- ACCOUNTS STATE ---
      accounts: [],
      accountsLoading: false,
      setAccounts: (a) => set({ accounts: a }),
      setAccountsLoading: (v) => set({ accountsLoading: v }),

      // --- TRANSACTIONS STATE ---
      transactions: [],
      transactionsLoading: false,
      setTransactions: (t) => set({ transactions: t }),
      setTransactionsLoading: (v) => set({ transactionsLoading: v }),

      // --- SUBSCRIPTIONS STATE ---
      subscriptions: null,
      subscriptionsLoading: false,
      setSubscriptions: (s) => set({ subscriptions: s }),
      setSubscriptionsLoading: (v) => set({ subscriptionsLoading: v }),

      // --- BUDGET STATE ---
      budget: null,
      budgetLoading: false,
      setBudget: (b) => set({ budget: b }),
      setBudgetLoading: (v) => set({ budgetLoading: v }),

      // --- INVESTMENTS STATE ---
      investments: null,
      investmentsLoading: false,
      setInvestments: (i) => set({ investments: i }),
      setInvestmentsLoading: (v) => set({ investmentsLoading: v }),

      // --- GOALS STATE ---
      goals: null, 
      goalsLoading: false,
      setGoals: (g) => set({ goals: g }),
      setGoalsLoading: (v) => set({ goalsLoading: v }),

      // --- INSIGHTS STATE (NEW AI BRAIN) ---
      insights: null,
      insightsLoading: false,
      setInsights: (i) => set({ insights: i }),
      setInsightsLoading: (v) => set({ insightsLoading: v }),

      // --- AGGREGATE METRICS ---
      currentNetWorth: 0,
      monthlyBudget: 0,
      monthlySpent: 0,
    }),
    {
      // --- PERSIST CONFIGURATION ---
      name: 'shyara-wealth-engine-cache',
      partialize: (state) => ({
        // We save the raw data and user preferences to the hard drive, 
        // while intentionally ignoring loading/UI states and AI Insights (to ensure fresh predictions).
        preferences: state.preferences,
        user: state.user,
        dashboard: state.dashboard,
        accounts: state.accounts,
        transactions: state.transactions,
        subscriptions: state.subscriptions,
        budget: state.budget,
        investments: state.investments,
        goals: state.goals, 
        currentNetWorth: state.currentNetWorth,
        monthlyBudget: state.monthlyBudget,
        monthlySpent: state.monthlySpent,
      }),
    }
  )
);
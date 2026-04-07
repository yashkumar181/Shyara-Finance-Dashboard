import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch(getToken, path, options = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

export function createApiClient(getToken) {
  const get = (path) => apiFetch(getToken, path);
  const post = (path, body) => apiFetch(getToken, path, { method: "POST", body: JSON.stringify(body) });
  const put = (path, body) => apiFetch(getToken, path, { method: "PUT", body: JSON.stringify(body) });
  const del = (path) => apiFetch(getToken, path, { method: "DELETE" });

  return {
    getUser: () => get("/api/v1/user"),
    syncUser: (body) => post("/api/v1/user", body),
    getDashboard: () => get("/api/v1/dashboard"),
    getAccounts: () => get("/api/v1/accounts"),
    createAccount: (body) => post("/api/v1/accounts", body),
    updateAccount: (id, body) => put(`/api/v1/accounts?id=${id}`, body),
    deleteAccount: (id) => del(`/api/v1/accounts?id=${id}`),
    getTransactions: (params) => {
      const qs = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v !== undefined)
      ).toString();
      return get(`/api/v1/transactions${qs ? "?" + qs : ""}`);
    },
    createTransaction: (body) => post("/api/v1/transactions", body),
    deleteTransaction: (id) => del(`/api/v1/transactions?id=${id}`),
    getSubscriptions: (status) => get(`/api/v1/subscriptions${status ? "?status=" + status : ""}`),
    createSubscription: (body) => post("/api/v1/subscriptions", body),
    updateSubscription: (id, body) => put(`/api/v1/subscriptions?id=${id}`, body),
    deleteSubscription: (id) => del(`/api/v1/subscriptions?id=${id}`),
    getBudget: (month) => get(`/api/v1/budget${month ? "?month=" + month : ""}`),
    createBudgetCategory: (body) => post("/api/v1/budget", body),
    updateBudgetCategory: (id, monthlyLimit) => put(`/api/v1/budget?id=${id}`, { monthlyLimit }),
    deleteBudgetCategory: (id) => del(`/api/v1/budget?id=${id}`),
    getInvestments: () => get("/api/v1/investments"),
    createHolding: (body) => post("/api/v1/investments", body),
    updateHolding: (id, body) => put(`/api/v1/investments?id=${id}`, body),
    deleteHolding: (id) => del(`/api/v1/investments?id=${id}`),
    // --- GOALS ---
    getGoals: () => get("/api/v1/goals"),
    createGoal: (body) => post("/api/v1/goals", body),
    updateGoal: (body) => put("/api/v1/goals", body),
    deleteGoal: (id) => del(`/api/v1/goals?id=${id}`),
  };
}

export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => createApiClient(getToken), [getToken]);
}
import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;
  
  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const monthlyStats = await sql`
      SELECT TO_CHAR(transaction_date, 'YYYY-MM') as month, type, SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = ${uid} AND transaction_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, type
      ORDER BY month ASC
    `;

    // NEW: Fetch weekly data for the line chart
    const weeklyStats = await sql`
      SELECT TO_CHAR(DATE_TRUNC('week', transaction_date), 'YYYY-MM-DD') as week, SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = ${uid} AND type = 'expense' AND transaction_date >= NOW() - INTERVAL '12 weeks'
      GROUP BY week ORDER BY week ASC
    `;

    const accounts = await sql`SELECT id, account_category, balance, outstanding, account_type, nickname FROM accounts WHERE user_id = ${uid} AND is_active = TRUE`;
    
    const recentTxns = await sql`SELECT id, merchant, amount, transaction_date, type FROM transactions WHERE user_id = ${uid} AND type = 'expense' AND transaction_date >= NOW() - INTERVAL '60 days'`;

    const goals = await sql`SELECT id, name, target_amount, current_amount, icon FROM goals WHERE user_id = ${uid} AND current_amount < target_amount ORDER BY priority ASC, created_at DESC LIMIT 3`;

    const ccPayments = await sql`SELECT SUM(t.amount) as total_payments FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.user_id = ${uid} AND a.account_type = 'credit_card' AND t.type = 'income' AND t.transaction_date >= NOW() - INTERVAL '6 months'`;

    // ---------------------------------------------------------
    // MATH ENGINES 
    // ---------------------------------------------------------
    const calculateCV = (dataArray) => {
      if (dataArray.length === 0) return 1;
      const mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (mean === 0) return 1;
      const variance = dataArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataArray.length;
      return Math.sqrt(variance) / mean;
    };

    const incomeTotals = monthlyStats.filter(row => row.type === 'income').map(row => parseFloat(row.total_amount));
    const expenseTotals = monthlyStats.filter(row => row.type === 'expense').map(row => parseFloat(row.total_amount));

    const incomeStabilityScore = 100 * (1 - Math.min(calculateCV(incomeTotals), 1));
    const expenseStabilityScore = 100 * (1 - Math.min(calculateCV(expenseTotals), 1));
    const uniqueCategories = new Set(accounts.map(a => a.account_category));
    const diversityScore = (uniqueCategories.size / 4) * 100;
    const healthScore = Math.round((incomeStabilityScore * 0.4) + (expenseStabilityScore * 0.3) + (Math.min(diversityScore, 100) * 0.3));

    const liquidCash = accounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const total60DayExpense = recentTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgDailyBurn = total60DayExpense / 60;
    const conservativeDailyIncome = incomeTotals.length > 0 ? Math.min(...incomeTotals) / 30 : 0;
    const netDailyVelocity = conservativeDailyIncome - avgDailyBurn;

    let projectedBalance = liquidCash;
    const forecast30Days = [];
    let hitsZero = false; let daysToZero = null;
    for (let i = 1; i <= 30; i++) {
      projectedBalance += netDailyVelocity;
      forecast30Days.push({ day: i, projected_balance: Math.round(projectedBalance) });
      if (projectedBalance <= 0 && !hitsZero) { hitsZero = true; daysToZero = i; }
    }

    let anomalies = [];
    if (recentTxns.length > 5) {
      const expenses = recentTxns.map(t => parseFloat(t.amount));
      const meanExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
      const stdDev = Math.sqrt(expenses.reduce((a, b) => a + Math.pow(b - meanExpense, 2), 0) / expenses.length);
      anomalies = recentTxns.filter(t => ((parseFloat(t.amount) - meanExpense) / (stdDev || 1)) > 2.5).map(t => ({
        id: t.id, merchant: t.merchant || 'Unknown', amount: parseFloat(t.amount), date: t.transaction_date, multiplier: (parseFloat(t.amount) / meanExpense).toFixed(1)
      })).slice(0, 3);
    }

    const avgMonthlyCCPayment = (parseFloat(ccPayments[0]?.total_payments) || 0) / 6;
    const totalCCDebt = accounts.filter(a => a.account_type === 'credit_card').reduce((sum, a) => sum + parseFloat(a.outstanding || 0), 0);
    let debtPayoffMonths = 0;
    if (totalCCDebt > 0 && avgMonthlyCCPayment > 0) debtPayoffMonths = Math.ceil(totalCCDebt / avgMonthlyCCPayment);
    else if (totalCCDebt > 0) debtPayoffMonths = -1;

    const totalInc6m = incomeTotals.reduce((a,b) => a+b, 0);
    const totalExp6m = expenseTotals.reduce((a,b) => a+b, 0);
    const avgMonthlySurplus = (totalInc6m - totalExp6m) / 6;

    const goalProjections = goals.map(g => {
       const remaining = parseFloat(g.target_amount) - parseFloat(g.current_amount);
       let months = -1; let status = 'Unrealistic';
       if (avgMonthlySurplus > 0) {
           months = Math.ceil(remaining / avgMonthlySurplus);
           if (months <= 24) status = 'On Track';
           else if (months <= 60) status = 'Challenging';
       }
       return { name: g.name, remaining: Math.round(remaining), monthsToTarget: months, status };
    });

    let burnRateTrend = 0;
    let burnRateMessage = "Stable";
    if (expenseTotals.length > 1) {
      const n = expenseTotals.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < n; i++) {
        const x = i + 1; const y = expenseTotals[i];
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
      }
      const slope = (n * sumXY - sumX * sumY) / ((n * sumX2) - (sumX * sumX) || 1);
      const meanExpense = sumY / n;
      burnRateTrend = meanExpense > 0 ? (slope / meanExpense) * 100 : 0;
      if (burnRateTrend > 5) burnRateMessage = "Lifestyle Creep Detected";
      else if (burnRateTrend < -5) burnRateMessage = "Burn Rate Decreasing";
      else burnRateMessage = "Pacing Optimal";
    }

    const liquidAccounts = accounts.filter(a => a.account_type !== 'credit_card');
    let maxConcentration = 0; let highestAccountName = "None";
    if (liquidCash > 0 && liquidAccounts.length > 0) {
      let maxBal = 0;
      liquidAccounts.forEach(a => {
        const bal = parseFloat(a.balance || 0);
        if (bal > maxBal) { maxBal = bal; highestAccountName = a.nickname || a.account_category; }
      });
      maxConcentration = (maxBal / liquidCash) * 100;
    }
    const concentrationRisk = maxConcentration > 80;

    // ---------------------------------------------------------
    // MISSING GRAPH DATA INJECTED HERE
    // ---------------------------------------------------------
    const burnRateHistory = {
      monthly: monthlyStats.filter(r => r.type === 'expense').map(r => {
        const date = new Date(r.month + '-01');
        return { name: date.toLocaleDateString('en-US', { month: 'short' }), value: parseFloat(r.total_amount) };
      }),
      weekly: weeklyStats.map(r => {
        return { name: new Date(r.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseFloat(r.total_amount) };
      })
    };

    res.status(200).json({
      healthScore, incomeStabilityScore: Math.round(incomeStabilityScore), expenseStabilityScore: Math.round(expenseStabilityScore), accountDiversityScore: Math.round(Math.min(diversityScore, 100)),
      liquidCash, netDailyVelocity: Math.round(netDailyVelocity), forecast30Days, hitsZero, daysToZero, anomalies,
      totalCCDebt: Math.round(totalCCDebt), debtPayoffMonths, avgMonthlySurplus: Math.round(avgMonthlySurplus), goalProjections,
      burnRateTrend: Math.round(burnRateTrend), burnRateMessage, maxConcentration: Math.round(maxConcentration), highestAccountName, concentrationRisk,
      burnRateHistory // <-- Sending the raw graph data down to React
    });

  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}
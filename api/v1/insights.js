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
    // ---------------------------------------------------------
    // 1. FETCH HISTORICAL DATA 
    // ---------------------------------------------------------
    const monthlyStats = await sql`
      SELECT TO_CHAR(transaction_date, 'YYYY-MM') as month, type, SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = ${uid} AND transaction_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, type
    `;

    const accounts = await sql`SELECT id, account_category, balance, outstanding, account_type FROM accounts WHERE user_id = ${uid} AND is_active = TRUE`;
    
    const recentTxns = await sql`
      SELECT id, merchant, amount, transaction_date, type 
      FROM transactions 
      WHERE user_id = ${uid} AND type = 'expense' AND transaction_date >= NOW() - INTERVAL '60 days'
    `;

    const goals = await sql`SELECT id, name, target_amount, current_amount, icon FROM goals WHERE user_id = ${uid} AND current_amount < target_amount ORDER BY priority ASC, created_at DESC LIMIT 3`;

    // Fetch credit card payments over the last 6 months (transfers/income to CC accounts)
    const ccPayments = await sql`
      SELECT SUM(t.amount) as total_payments
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ${uid} AND a.account_type = 'credit_card' AND t.type = 'income' AND t.transaction_date >= NOW() - INTERVAL '6 months'
    `;

    // ---------------------------------------------------------
    // 2. INSIGHT 1 & 6: CASH FLOW HEALTH & STABILITY
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

    // ---------------------------------------------------------
    // 3. INSIGHT 4: 30-DAY BALANCE FORECAST
    // ---------------------------------------------------------
    const liquidCash = accounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const total60DayExpense = recentTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgDailyBurn = total60DayExpense / 60;
    const conservativeDailyIncome = incomeTotals.length > 0 ? Math.min(...incomeTotals) / 30 : 0;
    const netDailyVelocity = conservativeDailyIncome - avgDailyBurn;

    let projectedBalance = liquidCash;
    const forecast30Days = [];
    let hitsZero = false;
    let daysToZero = null;

    for (let i = 1; i <= 30; i++) {
      projectedBalance += netDailyVelocity;
      forecast30Days.push({ day: i, projected_balance: Math.round(projectedBalance) });
      if (projectedBalance <= 0 && !hitsZero) {
        hitsZero = true;
        daysToZero = i;
      }
    }

    // ---------------------------------------------------------
    // 4. INSIGHT 9: SPENDING ANOMALY ALERTS
    // ---------------------------------------------------------
    let anomalies = [];
    if (recentTxns.length > 5) {
      const expenses = recentTxns.map(t => parseFloat(t.amount));
      const meanExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
      const stdDev = Math.sqrt(expenses.reduce((a, b) => a + Math.pow(b - meanExpense, 2), 0) / expenses.length);

      anomalies = recentTxns.filter(t => {
        return ((parseFloat(t.amount) - meanExpense) / (stdDev || 1)) > 2.5;
      }).map(t => ({
        id: t.id,
        merchant: t.merchant || 'Unknown',
        amount: parseFloat(t.amount),
        date: t.transaction_date,
        multiplier: (parseFloat(t.amount) / meanExpense).toFixed(1)
      })).slice(0, 3);
    }

    // ---------------------------------------------------------
    // 5. INSIGHT 7 & 11: LONG-TERM PROJECTIONS (NEW)
    // ---------------------------------------------------------
    // A. Debt Payoff Timeline
    const avgMonthlyCCPayment = (parseFloat(ccPayments[0]?.total_payments) || 0) / 6;
    const totalCCDebt = accounts.filter(a => a.account_type === 'credit_card').reduce((sum, a) => sum + parseFloat(a.outstanding || 0), 0);
    
    let debtPayoffMonths = 0;
    if (totalCCDebt > 0 && avgMonthlyCCPayment > 0) {
      debtPayoffMonths = Math.ceil(totalCCDebt / avgMonthlyCCPayment);
    } else if (totalCCDebt > 0) {
      debtPayoffMonths = -1; // Flag as: Debt increasing or no payment history
    }

    // B. Goal Achievability Score
    const totalInc6m = incomeTotals.reduce((a,b) => a+b, 0);
    const totalExp6m = expenseTotals.reduce((a,b) => a+b, 0);
    const avgMonthlySurplus = (totalInc6m - totalExp6m) / 6;

    const goalProjections = goals.map(g => {
       const remaining = parseFloat(g.target_amount) - parseFloat(g.current_amount);
       let months = -1;
       let status = 'Unrealistic';
       
       if (avgMonthlySurplus > 0) {
           months = Math.ceil(remaining / avgMonthlySurplus);
           if (months <= 24) status = 'On Track';
           else if (months <= 60) status = 'Challenging';
       }
       return { 
         name: g.name, 
         remaining: Math.round(remaining), 
         monthsToTarget: months, 
         status 
       };
    });

    res.status(200).json({
      healthScore, incomeStabilityScore: Math.round(incomeStabilityScore), expenseStabilityScore: Math.round(expenseStabilityScore), accountDiversityScore: Math.round(Math.min(diversityScore, 100)),
      liquidCash, netDailyVelocity: Math.round(netDailyVelocity), forecast30Days, hitsZero, daysToZero,
      anomalies,
      totalCCDebt: Math.round(totalCCDebt), debtPayoffMonths, // Insight 7
      avgMonthlySurplus: Math.round(avgMonthlySurplus), goalProjections // Insight 11
    });

  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}
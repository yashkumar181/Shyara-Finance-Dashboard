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

    const accounts = await sql`SELECT id, account_category, balance, account_type FROM accounts WHERE user_id = ${uid} AND is_active = TRUE`;
    
    const recentTxns = await sql`
      SELECT id, merchant, amount, transaction_date, type 
      FROM transactions 
      WHERE user_id = ${uid} AND type = 'expense' AND transaction_date >= NOW() - INTERVAL '60 days'
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
    // 3. INSIGHT 4: 30-DAY BALANCE FORECAST (SMA Model)
    // ---------------------------------------------------------
    const liquidCash = accounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance), 0);
    
    // Calculate average daily burn rate over the last 60 days
    const total60DayExpense = recentTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgDailyBurn = total60DayExpense / 60;
    
    // Calculate conservative income estimate (assume lowest recent month / 30)
    const conservativeDailyIncome = incomeTotals.length > 0 ? Math.min(...incomeTotals) / 30 : 0;
    const netDailyVelocity = conservativeDailyIncome - avgDailyBurn;

    // Generate 30-day projection coordinates
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
    // 4. INSIGHT 9: SPENDING ANOMALY ALERTS (Z-Score Model)
    // ---------------------------------------------------------
    let anomalies = [];
    if (recentTxns.length > 5) {
      const expenses = recentTxns.map(t => parseFloat(t.amount));
      const meanExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
      const variance = expenses.reduce((a, b) => a + Math.pow(b - meanExpense, 2), 0) / expenses.length;
      const stdDev = Math.sqrt(variance);

      // Flag if Z-Score > 2.5 (highly unusual)
      anomalies = recentTxns.filter(t => {
        const amount = parseFloat(t.amount);
        const zScore = (amount - meanExpense) / (stdDev || 1);
        return zScore > 2.5;
      }).map(t => ({
        id: t.id,
        merchant: t.merchant || 'Unknown',
        amount: parseFloat(t.amount),
        date: t.transaction_date,
        multiplier: (parseFloat(t.amount) / meanExpense).toFixed(1)
      })).slice(0, 3); // Keep only top 3 to avoid UI clutter
    }

    // Return the combined payload
    res.status(200).json({
      healthScore,
      incomeStabilityScore: Math.round(incomeStabilityScore),
      expenseStabilityScore: Math.round(expenseStabilityScore),
      accountDiversityScore: Math.round(Math.min(diversityScore, 100)),
      
      // New Insight 4 Payloads
      liquidCash,
      netDailyVelocity: Math.round(netDailyVelocity),
      forecast30Days,
      hitsZero,
      daysToZero,

      // New Insight 9 Payloads
      anomalies
    });

  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}
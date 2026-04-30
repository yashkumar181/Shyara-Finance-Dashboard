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
    // 1. FETCH HISTORICAL DATA (Last 6 Months)
    // ---------------------------------------------------------
    // We group transactions by month and type to calculate stability
    const monthlyStats = await sql`
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') as month,
        type,
        SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = ${uid} 
        AND transaction_date >= NOW() - INTERVAL '6 months'
      GROUP BY month, type
    `;

    // Fetch active accounts for the Diversity Score
    const accounts = await sql`SELECT account_category FROM accounts WHERE user_id = ${uid} AND is_active = TRUE`;

    // ---------------------------------------------------------
    // 2. INSIGHT 6: INCOME STABILITY INDEX & EXPENSE STABILITY
    // ---------------------------------------------------------
    // Helper function to calculate Coefficient of Variation (CV = StdDev / Mean)
    const calculateCV = (dataArray) => {
      if (dataArray.length === 0) return 1; // High variance if no data
      const mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (mean === 0) return 1;
      const variance = dataArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataArray.length;
      const stdDev = Math.sqrt(variance);
      return stdDev / mean;
    };

    // Extract monthly totals
    const incomeTotals = monthlyStats.filter(row => row.type === 'income').map(row => parseFloat(row.total_amount));
    const expenseTotals = monthlyStats.filter(row => row.type === 'expense').map(row => parseFloat(row.total_amount));

    // Calculate CVs
    const incomeCV = calculateCV(incomeTotals);
    const expenseCV = calculateCV(expenseTotals);

    // Score out of 100
    const incomeStabilityScore = 100 * (1 - Math.min(incomeCV, 1));
    const expenseStabilityScore = 100 * (1 - Math.min(expenseCV, 1));

    // ---------------------------------------------------------
    // 3. INSIGHT 1: OVERALL CASH FLOW HEALTH SCORE
    // ---------------------------------------------------------
    // Account Diversity: Check unique account categories (bank, digital, card)
    const uniqueCategories = new Set(accounts.map(a => a.account_category));
    const diversityScore = (uniqueCategories.size / 4) * 100; // Assuming 4 ideal categories

    // Final Weighted Health Score (40% Income, 30% Expense, 30% Diversity)
    const healthScore = Math.round((incomeStabilityScore * 0.4) + (expenseStabilityScore * 0.3) + (Math.min(diversityScore, 100) * 0.3));

    // Return the payload to the frontend
    res.status(200).json({
      healthScore: healthScore,
      incomeStabilityScore: Math.round(incomeStabilityScore),
      expenseStabilityScore: Math.round(expenseStabilityScore),
      accountDiversityScore: Math.round(Math.min(diversityScore, 100)),
      // ... we will append the other insights here in the next steps
    });

  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}
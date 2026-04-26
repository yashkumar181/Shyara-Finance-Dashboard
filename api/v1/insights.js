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
    const [accounts, investments, subscriptions, txns] = await Promise.all([
      sql`SELECT balance, account_type FROM accounts WHERE user_id = ${uid}`,
      sql`SELECT name, ticker_symbol, quantity, average_buy_price, current_price, beta, dividend_yield FROM investments WHERE user_id = ${uid}`,
      sql`SELECT amount, billing_day FROM subscriptions WHERE user_id = ${uid} AND status = 'active'`,
      sql`SELECT amount, transaction_date FROM transactions WHERE user_id = ${uid} AND type = 'expense' AND transaction_date >= NOW() - INTERVAL '90 days'`
    ]);

    // 1. Safe-to-Spend & Liquidity Crunch
    const liquidCash = accounts.filter(a => a.account_type !== 'credit_card').reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate() || 1;
    
    const upcomingBills = subscriptions.filter(s => s.billing_day > today.getDate()).reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const safeToSpendDaily = Math.max(0, (liquidCash - upcomingBills) / daysLeft);
    const liquidityRisk = liquidCash < upcomingBills;

    // 2. Lifestyle Creep Detection
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const recentSpend = txns.filter(t => new Date(t.transaction_date) >= thirtyDaysAgo).reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const previousSpend = txns.filter(t => new Date(t.transaction_date) < thirtyDaysAgo).reduce((sum, t) => sum + parseFloat(t.amount), 0) / 2; // Avg of prior 60 days
    const creepPercentage = previousSpend > 0 ? ((recentSpend - previousSpend) / previousSpend) * 100 : 0;

    // 3. Tax Loss Harvesting & Dividends & Beta
    let taxLossOpportunities = [];
    let annualDividends = 0;
    let totalPortfolioValue = 0;
    let weightedBetaSum = 0;

    investments.forEach(inv => {
      const qty = parseFloat(inv.quantity);
      const buyPrice = parseFloat(inv.average_buy_price);
      const curPrice = parseFloat(inv.current_price);
      const value = qty * curPrice;
      const loss = (qty * buyPrice) - value;

      if (loss > 500) { // Threshold for harvesting
        taxLossOpportunities.push({ name: inv.name, ticker: inv.ticker_symbol, harvestable_loss: loss });
      }

      annualDividends += value * parseFloat(inv.dividend_yield || 0);
      totalPortfolioValue += value;
      weightedBetaSum += value * parseFloat(inv.beta || 1);
    });

    const portfolioBeta = totalPortfolioValue > 0 ? (weightedBetaSum / totalPortfolioValue) : 1;

    res.status(200).json({
      safeToSpendDaily: Math.round(safeToSpendDaily),
      upcomingBills: Math.round(upcomingBills),
      liquidityRisk,
      creepPercentage: Math.round(creepPercentage),
      recentSpend: Math.round(recentSpend),
      taxLossOpportunities: taxLossOpportunities.sort((a,b) => b.harvestable_loss - a.harvestable_loss).slice(0, 2),
      annualDividends: Math.round(annualDividends),
      portfolioBeta: portfolioBeta.toFixed(2),
      totalPortfolioValue: Math.round(totalPortfolioValue)
    });
  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}
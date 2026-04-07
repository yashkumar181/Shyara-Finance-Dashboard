import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const [
      accountsRows, 
      monthlySpentRow, 
      totalBudgetRow, // <-- WE ARE FIXING THIS QUERY
      recentTxns, 
      wealthHistoryMonthly,
      wealthHistoryWeekly,
      wealthHistoryDaily,
      topMerchants,
      goalsRows
    ] = await Promise.all([
      sql`SELECT id, nickname, account_type, balance, outstanding, credit_limit FROM accounts WHERE user_id = ${uid} AND is_active = TRUE`,
      sql`SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ${uid} AND type = 'expense' AND TO_CHAR(transaction_date, 'YYYY-MM') = ${currentMonth}`,
      
      // FIXED: Now pointing to the new budget_configurations table
      sql`SELECT COALESCE(SUM(monthly_limit), 0) AS total FROM budget_configurations WHERE user_id = ${uid}`,
      
      sql`SELECT t.id, t.amount, t.type, t.category, t.sub_category, t.merchant, t.transaction_date, a.nickname AS account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id WHERE t.user_id = ${uid} ORDER BY t.transaction_date DESC LIMIT 5`,
      sql`SELECT TO_CHAR(transaction_date, 'Mon') AS label, TO_CHAR(transaction_date, 'YYYY-MM') AS sort_key, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses FROM transactions WHERE user_id = ${uid} AND transaction_date >= NOW() - INTERVAL '6 months' GROUP BY label, sort_key ORDER BY sort_key ASC`,
      sql`SELECT 'Week ' || TO_CHAR(transaction_date, 'W') AS label, TO_CHAR(DATE_TRUNC('week', transaction_date), 'YYYY-MM-DD') AS sort_key, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses FROM transactions WHERE user_id = ${uid} AND transaction_date >= NOW() - INTERVAL '4 weeks' GROUP BY label, sort_key ORDER BY sort_key ASC`,
      sql`SELECT TO_CHAR(transaction_date, 'Dy') AS label, TO_CHAR(transaction_date, 'YYYY-MM-DD') AS sort_key, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses FROM transactions WHERE user_id = ${uid} AND transaction_date >= NOW() - INTERVAL '7 days' GROUP BY label, sort_key ORDER BY sort_key ASC`,
      sql`SELECT merchant, SUM(amount) as total_spent, COUNT(*) as tx_count FROM transactions WHERE user_id = ${uid} AND type = 'expense' AND merchant IS NOT NULL AND merchant != '' GROUP BY merchant ORDER BY total_spent DESC LIMIT 4`,
      sql`SELECT id, name, icon, target_amount, current_amount, theme FROM goals WHERE user_id = ${uid} ORDER BY created_at ASC LIMIT 3`
    ]);

    let bankBalance = 0;
    let creditDebt = 0;

    for (const acc of accountsRows) {
      if (acc.account_type === "credit_card") {
        creditDebt += parseFloat(acc.outstanding) || 0;
      } else {
        bankBalance += parseFloat(acc.balance) || 0;
      }
    }

    const mapChartData = (data) => data.map(row => ({
      label: row.label,
      income: parseFloat(row.income) || 0,
      expense: parseFloat(row.expenses) || 0
    }));

    const merchants = topMerchants.map((m, idx) => {
      const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'];
      return {
        id: idx,
        name: m.merchant,
        sub: `${m.tx_count} Transactions`,
        amount: `₹${parseFloat(m.total_spent).toLocaleString('en-IN')}`,
        freq: 'Total Spent',
        initial: m.merchant.substring(0, 2).toUpperCase(),
        bg: colors[idx % colors.length].split(' ')[0],
        text: colors[idx % colors.length].split(' ')[1]
      };
    });

    const goals = goalsRows.map(g => {
      const current = parseFloat(g.current_amount) || 0;
      const target = parseFloat(g.target_amount) || 1;
      const progress = Math.min(Math.round((current / target) * 100), 100);
      
      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        current: current,
        target: target,
        progress: progress,
        theme: g.theme
      };
    });

    res.status(200).json({
      netWorth: bankBalance - creditDebt,
      bankBalance,
      creditDebt,
      monthlySpent: parseFloat(monthlySpentRow?.[0]?.total) || 0,
      monthlyBudget: parseFloat(totalBudgetRow?.[0]?.total) || 0,
      spendingPercentage: parseFloat(totalBudgetRow?.[0]?.total) > 0 ? Math.round((parseFloat(monthlySpentRow?.[0]?.total) / parseFloat(totalBudgetRow?.[0]?.total)) * 100) : 0,
      transactions: recentTxns.map(t => ({
        id: t.id,
        name: t.merchant || t.category || t.type,
        category: t.sub_category || t.category || t.type,
        amount: parseFloat(t.amount),
        date: t.transaction_date,
        type: t.type,
        account: t.account_name,
        icon: t.type === "income" ? "Home" : "ShoppingCart",
      })),
      charts: {
        monthly: mapChartData(wealthHistoryMonthly),
        weekly: mapChartData(wealthHistoryWeekly),
        daily: mapChartData(wealthHistoryDaily)
      },
      topMerchants: merchants,
      goals: goals
    });
  } catch (error) {
    console.error("Dashboard DB Error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
}
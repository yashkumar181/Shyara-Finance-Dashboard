import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "GET") {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysPassed = now.getDate();
      const daysLeft = daysInMonth - daysPassed + 1;

      const rows = await sql`
        SELECT 
          bc.*,
          COALESCE((
            SELECT SUM(t.amount) FROM transactions t 
            WHERE t.user_id = bc.user_id 
            AND t.category = bc.category_name 
            AND t.type = 'expense'
            AND t.transaction_date >= ${monthStart.toISOString()}
            AND t.transaction_date < ${nextMonth.toISOString()}
          ), 0) as spent
        FROM budget_configurations bc
        WHERE bc.user_id = ${uid}
        ORDER BY bc.monthly_limit DESC
      `;

      let totalLimit = 0;
      let totalSpent = 0;

      const categories = rows.map(r => {
        const limit = parseFloat(r.monthly_limit);
        const spent = parseFloat(r.spent);
        const remaining = limit - spent;
        
        totalLimit += limit;
        totalSpent += spent;

        return {
          id: r.id,
          name: r.category_name,
          limit,
          spent,
          remaining,
          dailySafeSpend: remaining > 0 ? (remaining / daysLeft) : 0,
          percentage: limit > 0 ? (spent / limit) * 100 : 0,
          icon: r.icon,
          allowRollover: r.allow_rollover
        };
      });

      // --- Predictive Velocity Engine ---
      const daysPassedSafe = daysPassed === 0 ? 1 : daysPassed;
      const currentVelocity = totalSpent / daysPassedSafe;
      const projectedTotalSpend = totalSpent + (currentVelocity * daysLeft);
      const projectedSurplus = totalLimit - projectedTotalSpend;

      return res.status(200).json({
        daysLeft,
        daysPassed,
        daysInMonth,
        summary: {
          totalLimit,
          totalSpent,
          totalRemaining: totalLimit - totalSpent,
          globalDailySafe: (totalLimit - totalSpent) > 0 ? (totalLimit - totalSpent) / daysLeft : 0,
          currentVelocity,
          projectedTotalSpend,
          projectedSurplus
        },
        categories
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch budget data" });
    }
  }

  if (req.method === "POST") {
    // We default category_type to 'Want' behind the scenes to satisfy the DB schema, 
    // but the UI doesn't need to worry about it anymore.
    const { category_name, monthly_limit, icon, allow_rollover } = req.body;
    try {
      const rows = await sql`
        INSERT INTO budget_configurations (user_id, category_name, category_type, monthly_limit, icon, allow_rollover)
        VALUES (${uid}, ${category_name}, 'Want', ${monthly_limit}, ${icon || 'PieChart'}, ${allow_rollover || false})
        ON CONFLICT (user_id, category_name) 
        DO UPDATE SET 
          monthly_limit = ${monthly_limit}, 
          allow_rollover = ${allow_rollover}
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save configuration" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      await sql`DELETE FROM budget_configurations WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
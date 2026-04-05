// api/v1/budget.ts
// GET    /api/v1/budget            — budget categories + actual spend for current month
// POST   /api/v1/budget            — create/upsert a budget category limit
// PUT    /api/v1/budget?id=N       — update monthly_limit
// DELETE /api/v1/budget?id=N       — delete budget rule
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db";
import { requireAuth, handleOptions } from "../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ── GET: budget categories + real spend ───────────────────────────────────
  if (req.method === "GET") {
    const month = (req.query.month as string) || defaultMonth;

    const rows = await sql`
      SELECT
        b.id,
        b.category,
        b.monthly_limit,
        b.month_year,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.user_id = b.user_id
             AND t.type = 'expense'
             AND t.category = b.category
             AND TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month_year),
          0
        ) AS spent
      FROM budgets b
      WHERE b.user_id = ${uid} AND b.month_year = ${month}
      ORDER BY b.monthly_limit DESC
    `;

    const categories = (rows as any[]).map((b) => {
      const limit = parseFloat(b.monthly_limit);
      const spent = parseFloat(b.spent);
      return {
        id: b.id,
        name: b.category,
        limit,
        spent,
        remaining: limit - spent,
        percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        monthYear: b.month_year,
        isOverBudget: spent > limit,
      };
    });

    const totalLimit = categories.reduce((s, c) => s + c.limit, 0);
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0);

    return res.status(200).json({
      month,
      categories,
      summary: {
        totalLimit,
        totalSpent,
        totalRemaining: totalLimit - totalSpent,
        overallPercentage: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
      },
    });
  }

  // ── POST: create/upsert budget rule ──────────────────────────────────────
  if (req.method === "POST") {
    const { category, monthlyLimit, monthYear } = req.body;
    const month = monthYear || defaultMonth;

    if (!category || !monthlyLimit) {
      return res.status(400).json({ error: "category and monthlyLimit are required" });
    }

    const insertRows = await sql`
      INSERT INTO budgets (user_id, category, monthly_limit, month_year)
      VALUES (${uid}, ${category}, ${parseFloat(monthlyLimit)}, ${month})
      ON CONFLICT (user_id, category, month_year)
      DO UPDATE SET monthly_limit = ${parseFloat(monthlyLimit)}
      RETURNING id, category, monthly_limit, month_year
    ` as any[];
    const row = insertRows[0];

    return res.status(201).json({
      id: row.id,
      name: row.category,
      limit: parseFloat(row.monthly_limit),
      monthYear: row.month_year,
    });
  }

  // ── PUT: update limit ─────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const budgetId = parseInt(req.query.id as string);
    if (!budgetId) return res.status(400).json({ error: "id required" });

    const { monthlyLimit } = req.body;
    if (!monthlyLimit) return res.status(400).json({ error: "monthlyLimit required" });

    const updatedRows = await sql`
      UPDATE budgets
      SET monthly_limit = ${parseFloat(monthlyLimit)}
      WHERE id = ${budgetId} AND user_id = ${uid}
      RETURNING id, category, monthly_limit, month_year
    ` as any[];
    const updated = updatedRows[0];

    if (!updated) return res.status(404).json({ error: "Budget not found" });

    return res.status(200).json({
      id: updated.id,
      name: updated.category,
      limit: parseFloat(updated.monthly_limit),
      monthYear: updated.month_year,
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const budgetId = parseInt(req.query.id as string);
    if (!budgetId) return res.status(400).json({ error: "id required" });

    await sql`DELETE FROM budgets WHERE id = ${budgetId} AND user_id = ${uid}`;

    return res.status(200).json({ deleted: budgetId });
  }

  res.status(405).json({ error: "Method not allowed" });
}
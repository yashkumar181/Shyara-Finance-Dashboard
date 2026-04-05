import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM subscriptions WHERE user_id = ${uid} AND status = 'active' ORDER BY billing_day ASC`;
    
    let total = 0;
    const subs = rows.map(r => {
        const amt = parseFloat(r.amount);
        total += amt;
        return { ...r, amount: amt };
    });

    return res.status(200).json({ summary: { monthlyTotal: total, activeCount: subs.length }, subscriptions: subs });
  }

  if (req.method === "POST") {
    const { serviceName, amount, billingCycle, billingDay, category } = req.body;
    const rows = await sql`
      INSERT INTO subscriptions (user_id, service_name, amount, billing_cycle, billing_day, category, status)
      VALUES (${uid}, ${serviceName}, ${amount}, ${billingCycle || 'monthly'}, ${billingDay}, ${category || 'General'}, 'active')
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: "Method not allowed" });
}
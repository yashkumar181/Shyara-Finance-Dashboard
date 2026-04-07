import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  // FETCH SUBSCRIPTIONS
  if (req.method === "GET") {
    try {
      const rows = await sql`SELECT * FROM subscriptions WHERE user_id = ${uid} AND status = 'active' ORDER BY billing_day ASC`;
      
      let total = 0;
      const subs = rows.map(r => {
          const amt = parseFloat(r.amount);
          total += amt;
          return { ...r, amount: amt };
      });

      return res.status(200).json({ summary: { monthlyTotal: total, activeCount: subs.length }, subscriptions: subs });
    } catch (err) {
      console.error("Fetch subs error:", err);
      return res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  }

  // CREATE SUBSCRIPTION
  if (req.method === "POST") {
    // 1. Accept both WhatsApp Chatbot (camelCase) and React Frontend (snake_case) formats
    const service_name = req.body.service_name || req.body.serviceName;
    const amount = req.body.amount;
    const billing_day = req.body.billing_day || req.body.billingDay || 1;
    const category = req.body.category || 'General';
    
    // 2. We accept billingCycle so the chatbot doesn't crash, but we don't insert it 
    // into the database because the 'billing_cycle' column doesn't exist in the schema.
    const billing_cycle = req.body.billing_cycle || req.body.billingCycle; 

    try {
      const rows = await sql`
        INSERT INTO subscriptions (user_id, service_name, amount, billing_day, category, status)
        VALUES (${uid}, ${service_name}, ${amount}, ${billing_day}, ${category}, 'active')
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Create sub error:", err);
      return res.status(500).json({ error: "Failed to create subscription" });
    }
  }

  // DELETE SUBSCRIPTION
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Subscription ID required" });
    try {
      await sql`DELETE FROM subscriptions WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Delete sub error:", err);
      return res.status(500).json({ error: "Failed to delete subscription" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
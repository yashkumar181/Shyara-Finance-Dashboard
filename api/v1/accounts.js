import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM accounts WHERE user_id = ${uid} ORDER BY created_at DESC`;
    return res.status(200).json(rows.map(r => ({ ...r, balance: parseFloat(r.balance), outstanding: parseFloat(r.outstanding) })));
  }

  if (req.method === "POST") {
    const { provider, nickname, accountType, balance, outstanding, creditLimit, currency } = req.body;
    const rows = await sql`
      INSERT INTO accounts (user_id, provider, nickname, account_type, balance, outstanding, credit_limit, currency)
      VALUES (${uid}, ${provider}, ${nickname}, ${accountType}, ${balance || 0}, ${outstanding || 0}, ${creditLimit || null}, ${currency || 'USD'})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: "Method not allowed" });
}
import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  // FETCH ACCOUNTS
  if (req.method === "GET") {
    try {
      const rows = await sql`SELECT * FROM accounts WHERE user_id = ${uid} AND is_active = TRUE ORDER BY created_at DESC`;
      return res.status(200).json(rows.map(r => ({ 
        ...r, 
        balance: parseFloat(r.balance) || 0, 
        outstanding: parseFloat(r.outstanding) || 0,
        credit_limit: parseFloat(r.credit_limit) || 0
      })));
    } catch (err) {
      console.error("Fetch accounts error:", err);
      return res.status(500).json({ error: "Failed to fetch accounts" });
    }
  }

  // CREATE ACCOUNT
  if (req.method === "POST") {
    const { bank_name, nickname, account_category, account_type, balance, outstanding, credit_limit, currency } = req.body;
    try {
      const rows = await sql`
        INSERT INTO accounts (user_id, bank_name, nickname, account_category, account_type, balance, outstanding, credit_limit, is_active)
        VALUES (${uid}, ${bank_name || null}, ${nickname}, ${account_category}, ${account_type}, ${balance || 0}, ${outstanding || 0}, ${credit_limit || null}, TRUE)
        RETURNING *
      `;
      const newAcc = rows[0];
      return res.status(201).json({
        ...newAcc,
        balance: parseFloat(newAcc.balance) || 0,
        outstanding: parseFloat(newAcc.outstanding) || 0,
        credit_limit: parseFloat(newAcc.credit_limit) || 0
      });
    } catch (err) {
      console.error("Account creation error:", err);
      return res.status(500).json({ error: "Failed to create account. Check constraints." });
    }
  }

  // DELETE ACCOUNT
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Account ID required" });
    
    try {
      await sql`DELETE FROM accounts WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
      console.error("Account deletion error:", err);
      return res.status(500).json({ error: "Failed to delete account" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
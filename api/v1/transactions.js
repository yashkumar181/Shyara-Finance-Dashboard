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
      const limit = parseInt(req.query.limit) || 50;
      // FIX 1: Capture the account ID if the frontend asks for a specific bank
      const accountId = req.query.account_id || req.query.accountId;

      let query;
      if (accountId) {
        query = sql`
          SELECT t.id, t.amount, t.type, t.category, t.sub_category, t.merchant, t.notes, t.transaction_date, t.payment_method, a.nickname AS account_name 
          FROM transactions t 
          LEFT JOIN accounts a ON t.account_id = a.id 
          WHERE t.user_id = ${uid} AND t.account_id = ${accountId}
          ORDER BY t.transaction_date DESC LIMIT ${limit}
        `;
      } else {
        query = sql`
          SELECT t.id, t.amount, t.type, t.category, t.sub_category, t.merchant, t.notes, t.transaction_date, t.payment_method, a.nickname AS account_name 
          FROM transactions t 
          LEFT JOIN accounts a ON t.account_id = a.id 
          WHERE t.user_id = ${uid} 
          ORDER BY t.transaction_date DESC LIMIT ${limit}
        `;
      }

      const rows = await query;
      
      const formatted = rows.map(t => ({
        id: t.id,
        amount: parseFloat(t.amount),
        type: t.type,
        category: t.category,
        subCategory: t.sub_category,
        merchant: t.merchant,
        notes: t.notes,
        date: t.transaction_date,
        accountName: t.account_name,
        icon: t.type === "income" ? "Home" : t.category === "Food & Dining" ? "ShoppingCart" : t.category === "Entertainment" ? "Tv" : t.category === "Shopping" ? "Laptop" : "CreditCard",
      }));

      // Return raw array to match your frontend expectations
      return res.status(200).json(formatted); 
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }

  if (req.method === "POST") {
    try {
      // FIX 2: Ensure we capture account_id reliably
      const account_id = req.body.account_id || req.body.accountId;
      const { amount, type, category, subCategory, merchant, notes, date, paymentMethod } = req.body;
      const txDate = date ? new Date(date) : new Date();
      const parsedAmount = parseFloat(amount);

      // Step A: Insert Transaction
      const rows = await sql`
        INSERT INTO transactions (user_id, account_id, amount, type, category, sub_category, merchant, notes, transaction_date, payment_method)
        VALUES (${uid}, ${account_id || null}, ${parsedAmount}, ${type}, ${category}, ${subCategory || null}, ${merchant || null}, ${notes || null}, ${txDate}, ${paymentMethod || null})
        RETURNING id, amount, type, category, merchant, transaction_date
      `;
      
      const newTx = rows[0];

      // Step B: Actually update the live bank balances!
      if (account_id) {
        if (type === 'expense') {
          await sql`UPDATE accounts SET balance = balance - ${parsedAmount} WHERE id = ${account_id} AND account_type != 'credit_card'`;
          await sql`UPDATE accounts SET outstanding = outstanding + ${parsedAmount} WHERE id = ${account_id} AND account_type = 'credit_card'`;
        } else if (type === 'income') {
          await sql`UPDATE accounts SET balance = balance + ${parsedAmount} WHERE id = ${account_id} AND account_type != 'credit_card'`;
          await sql`UPDATE accounts SET outstanding = GREATEST(0, outstanding - ${parsedAmount}) WHERE id = ${account_id} AND account_type = 'credit_card'`;
        }
      }

      return res.status(201).json({
          ...newTx, 
          amount: parseFloat(newTx.amount), 
          date: newTx.transaction_date,
          icon: newTx.type === "income" ? "Home" : "CreditCard"
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to create transaction" });
    }
  }

  if (req.method === "DELETE") {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing ID" });
    await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${uid}`;
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "GET") {
    const rows = await sql`SELECT * FROM investments WHERE user_id = ${uid}`;
    return res.status(200).json(rows.map(r => ({ ...r, quantity: parseFloat(r.quantity), average_buy_price: parseFloat(r.average_buy_price) })));
  }

  res.status(405).json({ error: "Method not allowed" });
}
import { getDb } from "../../../lib/db.js";
import { requireAuth, handleOptions } from "../../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "DELETE") {
    try {
      await sql`DELETE FROM transactions WHERE user_id = ${uid}`;
      await sql`DELETE FROM investments WHERE user_id = ${uid}`;
      await sql`DELETE FROM goals WHERE user_id = ${uid}`;
      await sql`DELETE FROM budget_configurations WHERE user_id = ${uid}`;
      await sql`DELETE FROM accounts WHERE user_id = ${uid}`;

      return res.status(200).json({ success: true, message: "Data purged successfully" });
    } catch (e) {
      return res.status(500).json({ error: "Failed to purge data" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
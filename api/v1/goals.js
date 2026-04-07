import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  // READ (Fetch all goals)
  if (req.method === "GET") {
    try {
      const rows = await sql`SELECT * FROM goals WHERE user_id = ${uid} ORDER BY created_at DESC`;
      return res.status(200).json(rows.map(r => ({
        ...r,
        target_amount: parseFloat(r.target_amount),
        current_amount: parseFloat(r.current_amount)
      })));
    } catch (err) {
      console.error("Fetch goals error:", err);
      return res.status(500).json({ error: "Failed to fetch goals" });
    }
  }

  // CREATE (Add a new goal)
  if (req.method === "POST") {
    const { name, target_amount, current_amount, icon, theme, priority } = req.body;
    try {
      const rows = await sql`
        INSERT INTO goals (user_id, name, target_amount, current_amount, icon, theme, priority)
        VALUES (${uid}, ${name}, ${target_amount}, ${current_amount || 0}, ${icon || 'Target'}, ${theme || 'blue'}, ${priority || 'Medium'})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Create goal error:", err);
      return res.status(500).json({ error: "Failed to create goal" });
    }
  }

  // UPDATE (Change priority or amount)
  if (req.method === "PUT") {
    const { id, priority, current_amount } = req.body;
    if (!id) return res.status(400).json({ error: "Goal ID required" });

    try {
      // Build dynamic update query based on what was passed
      if (priority && current_amount !== undefined) {
         await sql`UPDATE goals SET priority = ${priority}, current_amount = ${current_amount} WHERE id = ${id} AND user_id = ${uid}`;
      } else if (priority) {
         await sql`UPDATE goals SET priority = ${priority} WHERE id = ${id} AND user_id = ${uid}`;
      } else if (current_amount !== undefined) {
         await sql`UPDATE goals SET current_amount = ${current_amount} WHERE id = ${id} AND user_id = ${uid}`;
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Update goal error:", err);
      return res.status(500).json({ error: "Failed to update goal" });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Goal ID required" });
    try {
      await sql`DELETE FROM goals WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Delete goal error:", err);
      return res.status(500).json({ error: "Failed to delete goal" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
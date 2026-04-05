import { getDb } from "../../lib/db.js";
import { handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.slice(7);
  let clerkUserId, phone;

  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    clerkUserId = payload.sub;
    
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${clerkSecretKey}` },
    });
    
    if (clerkRes.ok) {
        const clerkUser = await clerkRes.json();
        phone = clerkUser.unsafe_metadata?.phone;
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const sql = getDb();
  const normalizedPhone = phone ? phone.replace(/[\s\-]/g, "").replace(/^\+/, "") : null;

  if (req.method === "GET") {
    if (!normalizedPhone) return res.status(404).json({ error: "No phone in metadata" });
    const rows = await sql`SELECT id, first_name, last_name, phone_number, is_registered FROM users WHERE phone_number = ${normalizedPhone} LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(rows[0]);
  }

  if (req.method === "POST") {
    const { firstName, lastName, phone: reqPhone } = req.body;
    const p = normalizedPhone || reqPhone?.replace(/[\s\-]/g, "").replace(/^\+/, "");
    if (!p) return res.status(400).json({ error: "Phone number required" });

    const rows = await sql`
      INSERT INTO users (clerk_id, first_name, last_name, phone_number, is_registered)
      VALUES (${clerkUserId}, ${firstName || ""}, ${lastName || ""}, ${p}, TRUE)
      ON CONFLICT (phone_number) DO UPDATE 
      SET clerk_id = EXCLUDED.clerk_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, is_registered = TRUE
      RETURNING id, first_name, last_name, phone_number, is_registered
    `;
    return res.status(200).json(rows[0]);
  }

  res.status(405).json({ error: "Method not allowed" });
}
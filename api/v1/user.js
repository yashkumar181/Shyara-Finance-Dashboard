import { getDb } from "../../lib/db.js";
import { handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  try {
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
      console.error("Token decoding error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const sql = getDb();
    
    // Exact original formatting to preserve your historical data links
    const normalizedPhone = phone ? phone.replace(/[\s\-]/g, "").replace(/^\+/, "") : null;

    if (req.method === "GET") {
      if (!normalizedPhone) return res.status(404).json({ error: "No phone in metadata" });
      
      const rows = await sql`SELECT id, name, phone_number, is_registered FROM users WHERE phone_number = ${normalizedPhone} LIMIT 1`;
      if (!rows.length) return res.status(404).json({ error: "User not found" });
      
      return res.status(200).json(rows[0]);
    }

    if (req.method === "POST") {
      const { firstName, lastName, phone: reqPhone } = req.body || {}; 
      
      const p = normalizedPhone || (reqPhone ? reqPhone.replace(/[\s\-]/g, "").replace(/^\+/, "") : null);
      if (!p) return res.status(400).json({ error: "Phone number required" });

      // Combine names to fit the strict DB schema
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";

      const rows = await sql`
        INSERT INTO users (phone_number, name, is_registered)
        VALUES (${p}, ${fullName}, TRUE)
        ON CONFLICT (phone_number) DO UPDATE 
        SET name = EXCLUDED.name, is_registered = TRUE
        RETURNING id, name, phone_number, is_registered
      `;
      return res.status(200).json(rows[0]);
    }

    res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("🔥 FATAL USER API ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
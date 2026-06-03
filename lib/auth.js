import { getDb } from "./db.js";

export async function requireAuth(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const clerkUserId = payload.sub;
    
    if (!clerkUserId) throw new Error("No sub claim in token");

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      res.status(401).json({ error: "Token expired" });
      return null;
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY not set in .env");

    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!clerkRes.ok) {
      res.status(401).json({ error: "Could not verify Clerk user" });
      return null;
    }

    const clerkUser = await clerkRes.json();
    const phone = clerkUser.unsafe_metadata?.phone;

    if (!phone) {
      res.status(403).json({ error: "Onboarding incomplete — phone number not found in profile" });
      return null;
    }

    const normalizedPhone = phone.replace(/[\s\-]/g, "").replace(/^\+/, "");
    const sql = getDb();
    
    const rows = await sql`
      SELECT id FROM users
      WHERE phone_number = ${normalizedPhone}
        AND is_registered = TRUE
      LIMIT 1
    `;

    if (!rows.length) {
      res.status(403).json({ error: `User not found. Clerk sent phone: '${normalizedPhone}'.` });
      return null;
    }

    return {
      clerkUserId,
      dbUserId: rows[0].id,
      phone: normalizedPhone,
    };
  } catch (err) {
    console.error("🔥 AUTH CRASH DETAILS:", err.message);
    res.status(401).json({ error: `Auth failed: ${err.message}` });
    return null;
  }
}

export function handleOptions(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
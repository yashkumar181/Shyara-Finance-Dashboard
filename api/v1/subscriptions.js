import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

// --- Detection Helpers ---
function classifyFrequency(avgDays) {
  if (avgDays <= 9) return "weekly";
  if (avgDays <= 35) return "monthly";
  if (avgDays >= 80 && avgDays <= 100) return "quarterly";
  if (avgDays >= 330) return "annual";
  return "irregular";
}

function addDays(date, n) {
  return new Date(date.getTime() + n * 86400000);
}

function iconForCategory(cat) {
  const map = {
    "Entertainment": "🎬", "Food & Dining": "🍔", "Shopping": "🛒",
    "Healthcare": "🏥", "Housing": "🏠", "Education": "📚", "Transport": "🚗"
  };
  return map[cat] || "💳";
}

function detectPatterns(transactions) {
  const groups = {};
  for (const tx of transactions) {
    if (!tx.merchant) continue;
    const key = `${tx.merchant.toLowerCase().trim()}::${Math.round(tx.amount / 10) * 10}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }

  const detected = [];
  for (const txs of Object.values(groups)) {
    if (txs.length < 2) continue;
    const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86400000);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
    const confidence = Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)));

    if (confidence < 40) continue; 

    const freq = classifyFrequency(mean);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const avgAmount = sorted.reduce((s, t) => s + t.amount, 0) / sorted.length;

    detected.push({
      merchant: sorted[0].merchant,
      icon: iconForCategory(sorted[0].category),
      category: sorted[0].category || "Other",
      amount: Math.round(avgAmount),
      frequency: freq,
      lastCharged: lastDate.toISOString().split("T")[0],
      nextExpected: addDays(lastDate, Math.round(mean)).toISOString().split("T")[0],
      occurrences: sorted.length,
      confidence,
      totalSpent: Math.round(sorted.reduce((s, t) => s + t.amount, 0)),
    });
  }
  return detected;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  try {
    if (req.method === "GET") {
      const savedRaw = await sql`SELECT * FROM recurring_payments WHERE user_id = ${uid} ORDER BY created_at DESC`;
      const txRaw = await sql`
        SELECT merchant, amount, transaction_date AS date, category 
        FROM transactions 
        WHERE user_id = ${uid} AND type = 'expense' AND merchant IS NOT NULL AND transaction_date >= NOW() - INTERVAL '12 months' 
        ORDER BY transaction_date ASC
      `;

      const allDetected = detectPatterns(txRaw.map(t => ({ merchant: t.merchant, amount: parseFloat(t.amount), date: t.date, category: t.category })));
      const savedMerchants = new Set(savedRaw.map(s => s.merchant?.toLowerCase()));
      const newDetected = allDetected.filter(d => !savedMerchants.has(d.merchant.toLowerCase()));

      return res.status(200).json({ saved: savedRaw, detected: newDetected });
    }

    if (req.method === "POST") {
      const { merchant, icon, category, amount, frequency, lastCharged, nextExpected, occurrences, confidence, totalSpent, status = "confirmed" } = req.body;
      const insertRaw = await sql`
        INSERT INTO recurring_payments (user_id, merchant, icon, category, amount, frequency, last_charged, next_expected, occurrences, confidence, total_spent, status)
        VALUES (${uid}, ${merchant}, ${icon || "💳"}, ${category || "Other"}, ${parseFloat(amount)}, ${frequency}, ${lastCharged || null}, ${nextExpected || null}, ${occurrences || 1}, ${confidence || 50}, ${parseFloat(totalSpent || amount)}, ${status})
        RETURNING *
      `;
      return res.status(201).json(insertRaw[0]);
    }

    if (req.method === "PUT") {
      const id = req.query.id;
      const { status } = req.body;
      const updateRaw = await sql`UPDATE recurring_payments SET status = COALESCE(${status || null}, status) WHERE id = ${id} AND user_id = ${uid} RETURNING *`;
      return res.status(200).json(updateRaw[0]);
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      await sql`DELETE FROM recurring_payments WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ deleted: id });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Sub API Error:", error);
    res.status(500).json({ error: "Failed to process subscriptions" });
  }
}
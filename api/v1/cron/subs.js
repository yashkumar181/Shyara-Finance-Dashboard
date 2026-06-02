import { getDb } from "../../../lib/db.js";

export default async function handler(req, res) {
  // Security lock temporarily disabled for local testing
   //if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
   //  return res.status(401).json({ error: "Unauthorized" });
  // }

  const sql = getDb();

  try {
    const dueSubs = await sql`
      SELECT * FROM recurring_payments 
      WHERE status = 'confirmed' 
      AND next_expected <= CURRENT_DATE
    `;

    let processedCount = 0;

    for (const sub of dueSubs) {
      // A. Insert the automatic transaction WITH the correct account_id
      await sql`
        INSERT INTO transactions (user_id, account_id, merchant, amount, type, category, transaction_date)
        VALUES (${sub.user_id}, ${sub.account_id}, ${sub.merchant}, ${sub.amount}, 'expense', ${sub.category}, CURRENT_DATE)
      `;

      // B. Actually deduct the money from the linked bank/credit account!
      if (sub.account_id) {
        await sql`
          UPDATE accounts 
          SET balance = balance - ${sub.amount} 
          WHERE id = ${sub.account_id}
        `;
      }

      // C. Calculate the next billing cycle date
      let interval = '1 month';
      if (sub.frequency === 'weekly') interval = '1 week';
      if (sub.frequency === 'quarterly') interval = '3 months';
      if (sub.frequency === 'annual') interval = '1 year';

      // D. Update the subscription tracker
      await sql`
        UPDATE recurring_payments 
        SET last_charged = CURRENT_DATE, 
            next_expected = CURRENT_DATE + ${interval}::interval,
            occurrences = occurrences + 1,
            total_spent = total_spent + ${sub.amount}
        WHERE id = ${sub.id}
      `;
      processedCount++;
    }

    return res.status(200).json({ success: true, processed: processedCount });
  } catch (error) {
    console.error("Auto-Billing Cron Error:", error); 
    return res.status(500).json({ error: "Failed to process auto-billing", details: error.message });
  }
}
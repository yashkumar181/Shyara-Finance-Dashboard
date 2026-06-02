import { getDb } from "../../../lib/db.js";

export default async function handler(req, res) {
    // Security lock temporarily disabled for local testing
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const sql = getDb();

    try {
        const dueSubs = await sql`
      SELECT * FROM recurring_payments 
      WHERE status = 'confirmed' 
      AND next_expected <= CURRENT_DATE
    `;

        let processedCount = 0;

        for (const sub of dueSubs) {
            // A. Insert the automatic transaction (Removed 'notes' to ensure schema compatibility)
            await sql`
        INSERT INTO transactions (user_id, merchant, amount, type, category, transaction_date)
        VALUES (${sub.user_id}, ${sub.merchant}, ${sub.amount}, 'expense', ${sub.category}, CURRENT_DATE)
      `;

            // B. Calculate the next billing cycle date
            let interval = '1 month';
            if (sub.frequency === 'weekly') interval = '1 week';
            if (sub.frequency === 'quarterly') interval = '3 months';
            if (sub.frequency === 'annual') interval = '1 year';

            // C. Update the subscription tracker (FIXED: Using Postgres ::interval cast)
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
        // This will print the EXACT reason it failed to your terminal
        console.error("Auto-Billing Cron Error:", error);
        return res.status(500).json({ error: "Failed to process auto-billing", details: error.message });
    }
}
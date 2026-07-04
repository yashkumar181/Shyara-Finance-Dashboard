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
      const assets = await sql`SELECT * FROM investments WHERE user_id = ${uid}`;
      const history = await sql`SELECT * FROM investment_transactions WHERE user_id = ${uid} ORDER BY transaction_date DESC`;

      const enrichedAssets = assets.map(asset => {
        const assetHistory = history
          .filter(h => h.investment_id === asset.id)
          .map(h => ({
            id: h.id,
            date: h.transaction_date,
            action: h.action,
            quantity: parseFloat(h.quantity),
            price: parseFloat(h.price),
            // Realized P&L is captured if the user sells shares
            pnl: h.action === 'Sell' ? (parseFloat(h.price) - parseFloat(asset.avg_price)) * parseFloat(h.quantity) : 0
          }));

        return {
          id: asset.id,
          asset_class: asset.asset_class,
          type: asset.asset_type,
          symbol: asset.symbol,
          name: asset.name,
          quantity: parseFloat(asset.quantity),
          avgPrice: parseFloat(asset.avg_price),
          currentPrice: parseFloat(asset.current_price) || parseFloat(asset.avg_price), 
          metadata: asset.metadata || {},
          history: assetHistory
        };
      });

      return res.status(200).json(enrichedAssets);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to fetch investments" });
    }
  }

  if (req.method === "POST") {
    try {
      const { asset_class, asset_type, symbol, name, quantity, price, date, metadata, action = 'Buy' } = req.body;
      const parsedQty = parseFloat(quantity);
      const parsedPrice = parseFloat(price);
      
      const safeSymbol = symbol ? symbol.toUpperCase().trim() : '';
      const safeName = name ? name.trim() : '';

      // Find if asset exists
      let existingAssetMatch = safeSymbol 
        ? await sql`SELECT * FROM investments WHERE user_id = ${uid} AND symbol = ${safeSymbol} AND asset_class = ${asset_class} LIMIT 1`
        : await sql`SELECT * FROM investments WHERE user_id = ${uid} AND name = ${safeName} AND asset_class = ${asset_class} LIMIT 1`;

      let investmentId;

      if (action === 'Sell') {
        if (!existingAssetMatch || existingAssetMatch.length === 0) {
          return res.status(400).json({ error: "Cannot sell an asset you do not own." });
        }
        
        const existingAsset = existingAssetMatch[0];
        investmentId = existingAsset.id;
        const oldQty = parseFloat(existingAsset.quantity);

        if (oldQty < parsedQty) {
          return res.status(400).json({ error: `Insufficient quantity. You only own ${oldQty} units.` });
        }

        const newQty = oldQty - parsedQty;

        // Selling doesn't change WAP average cost base, it only reduces absolute holdings count
        await sql`
          UPDATE investments 
          SET quantity = ${newQty}, updated_at = NOW() 
          WHERE id = ${investmentId}
        `;
      } else {
        // Handle "Buy" action
        if (existingAssetMatch && existingAssetMatch.length > 0) {
          const existingAsset = existingAssetMatch[0];
          investmentId = existingAsset.id;

          const oldQty = parseFloat(existingAsset.quantity);
          const oldAvgPrice = parseFloat(existingAsset.avg_price);

          const newQty = oldQty + parsedQty;
          const newAvgPrice = ((oldQty * oldAvgPrice) + (parsedQty * parsedPrice)) / newQty;

          await sql`
            UPDATE investments 
            SET quantity = ${newQty}, avg_price = ${newAvgPrice}, current_price = ${parsedPrice}, updated_at = NOW()
            WHERE id = ${investmentId}
          `;
        } else {
          const newAsset = await sql`
            INSERT INTO investments (user_id, asset_class, asset_type, symbol, name, quantity, avg_price, current_price, metadata)
            VALUES (${uid}, ${asset_class}, ${asset_type}, ${safeSymbol}, ${safeName}, ${parsedQty}, ${parsedPrice}, ${parsedPrice}, ${metadata || '{}'})
            RETURNING id
          `;
          investmentId = newAsset[0].id;
        }
      }

      // Log the action to transaction logs
      await sql`
        INSERT INTO investment_transactions (investment_id, user_id, action, quantity, price, transaction_date)
        VALUES (${investmentId}, ${uid}, ${action}, ${parsedQty}, ${parsedPrice}, ${date || new Date().toISOString()})
      `;

      return res.status(201).json({ success: true, investmentId });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to log investment entry" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id, transaction_id } = req.query;

      if (transaction_id) {
        // Delete a specific transaction ledger entry
        const txRows = await sql`SELECT * FROM investment_transactions WHERE id = ${transaction_id} AND user_id = ${uid}`;
        if (txRows.length === 0) return res.status(404).json({ error: "Transaction not found" });
        
        const targetInvestmentId = txRows[0].investment_id;
        await sql`DELETE FROM investment_transactions WHERE id = ${transaction_id}`;

        // Recalculate entire WAP asset metrics from remaining logs
        const remainingTx = await sql`SELECT * FROM investment_transactions WHERE investment_id = ${targetInvestmentId}`;
        
        if (remainingTx.length === 0) {
          await sql`DELETE FROM investments WHERE id = ${targetInvestmentId}`;
        } else {
          let totalQty = 0;
          let totalCostBasis = 0;
          let latestPrice = 0;

          // Re-evaluate current metrics sequentially
          remainingTx.forEach(tx => {
            const qty = parseFloat(tx.quantity);
            const price = parseFloat(tx.price);
            if (tx.action === 'Buy') {
              totalCostBasis += (qty * price);
              totalQty += qty;
              latestPrice = price;
            } else if (tx.action === 'Sell') {
              totalQty -= qty;
            }
          });

          const newAvgPrice = totalQty > 0 ? (totalCostBasis / remainingTx.filter(t => t.action === 'Buy').reduce((s, t) => s + parseFloat(t.quantity), 0)) : 0;

          await sql`
            UPDATE investments 
            SET quantity = ${totalQty}, avg_price = ${newAvgPrice}, current_price = ${latestPrice || avg_price} 
            WHERE id = ${targetInvestmentId}
          `;
        }
        return res.status(200).json({ success: true });
      }

      if (id) {
        // Wipe out full asset position cascading down
        await sql`DELETE FROM investments WHERE id = ${id} AND user_id = ${uid}`;
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Missing parameters" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed deletion compilation" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
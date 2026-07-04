import { getDb } from "../../../lib/db.js";
import { requireAuth, handleOptions } from "../../../lib/auth.js";
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "POST") {
    try {
      const assets = await sql`
        SELECT id, symbol, asset_type, name, metadata 
        FROM investments 
        WHERE user_id = ${uid} 
        AND asset_class IN ('market', 'commodity')
      `;

      let updatedCount = 0;

      for (const asset of assets) {
        let livePrice = null;
        
        // Parse existing metadata safely
        let assetMetadata = typeof asset.metadata === 'string' ? JSON.parse(asset.metadata) : (asset.metadata || {});

        try {
          // --- CRYPTO LOGIC ---
          if (asset.asset_type.toLowerCase() === 'crypto' || asset.name.toLowerCase().includes('bitcoin')) {
            let cgId = 'bitcoin'; 
            if (asset.symbol === 'ETH') cgId = 'ethereum';
            if (asset.symbol === 'SOL') cgId = 'solana';

            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=inr`);
            const data = await response.json();
            if (data[cgId] && data[cgId].inr) livePrice = data[cgId].inr;
          } 
          
          // --- INDIAN STOCKS & ETFs LOGIC ---
          else if (asset.asset_type.toLowerCase() === 'stock' || asset.asset_type.toLowerCase() === 'etf') {
            const ticker = asset.symbol.includes('.') ? asset.symbol : `${asset.symbol}.NS`;
            const quote = await yahooFinance.quote(ticker);
            
            if (quote && quote.regularMarketPrice) {
              livePrice = quote.regularMarketPrice;
              
              // NEW: Capture Market Intelligence (Dividends & Earnings)
              if (quote.exDividendDate) assetMetadata.exDividendDate = quote.exDividendDate;
              if (quote.dividendRate) assetMetadata.dividendRate = quote.dividendRate;
              if (quote.earningsTimestamp) assetMetadata.earningsDate = quote.earningsTimestamp;
            }
          }

          // --- COMMODITIES LOGIC ---
          else if (asset.asset_type.toLowerCase() === 'gold') {
             const quote = await yahooFinance.quote('GC=F');
             const usdInr = await yahooFinance.quote('INR=X'); 
             if (quote && usdInr) {
                const pricePerGramUSD = quote.regularMarketPrice / 31.1035;
                livePrice = (pricePerGramUSD * usdInr.regularMarketPrice) * 10;
             }
          }

          // Update the Database with Price AND Intelligence
          if (livePrice !== null && !isNaN(livePrice)) {
            await sql`
              UPDATE investments 
              SET current_price = ${livePrice}, 
                  metadata = ${assetMetadata},
                  updated_at = NOW() 
              WHERE id = ${asset.id}
            `;
            updatedCount++;
          }
        } catch (fetchErr) {
          console.error(`Failed to fetch data for ${asset.symbol}:`, fetchErr.message);
        }
      }

      return res.status(200).json({ success: true, updated: updatedCount });
    } catch (e) {
      console.error("Sync error:", e);
      return res.status(500).json({ error: "Failed to synchronize live data." });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
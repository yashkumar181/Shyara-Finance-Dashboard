import { getDb } from "../../../lib/db.js";
import { requireAuth, handleOptions } from "../../../lib/auth.js";

// Yahoo blocks requests with no/blank User-Agent, so we spoof a normal browser UA.
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

// Lightweight, no-auth-required Yahoo endpoint fetching both LTP and Previous Close
async function fetchYahooPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) {
    throw new Error(`Yahoo chart fetch failed for ${symbol}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  
  if (!meta || meta.regularMarketPrice === undefined) {
    throw new Error(`No price returned by Yahoo for ${symbol}`);
  }
  
  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice
  };
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  if (req.method === "POST") {
    try {
      const assets = await sql`
        SELECT id, symbol, asset_type, name, metadata, asset_class 
        FROM investments 
        WHERE user_id = ${uid} 
        AND asset_class IN ('market', 'commodity')
      `;

      let updatedCount = 0;
      const fmpKey = process.env.FMP_API_KEY;

      // PRE-FETCH FOREX: live USD/INR rate
      let usdInrRate = 83.5; 
      try {
        const { price } = await fetchYahooPrice("USDINR=X");
        usdInrRate = price;
      } catch (e) {
        console.error("Failed to fetch USD/INR rate from Yahoo, using fallback:", e.message);
      }

      for (const asset of assets) {
        let livePrice = null;
        let assetMetadata =
          typeof asset.metadata === "string" ? JSON.parse(asset.metadata) : asset.metadata || {};

        const type = (asset.asset_type || "").trim().toLowerCase();
        const className = (asset.asset_class || "").trim().toLowerCase();

        try {
          // ==========================================
          // 1. CRYPTO ENGINE (Yahoo, direct INR pairs)
          // ==========================================
          if (type === "crypto" || asset.name.toLowerCase().includes("bitcoin")) {
            let base = asset.symbol;
            if (asset.name.toLowerCase().includes("bitcoin")) base = "BTC";
            else if (asset.name.toLowerCase().includes("ethereum")) base = "ETH";
            else if (asset.name.toLowerCase().includes("solana")) base = "SOL";

            const yahooSymbol = `${base}-INR`;
            const { price, previousClose } = await fetchYahooPrice(yahooSymbol);
            
            livePrice = price;
            assetMetadata.previousClose = previousClose;
          }

          // ==========================================
          // 2. STOCKS & ETFs HYBRID ENGINE 
          // ==========================================
          else if (type === "stock" || type === "etf" || type === "mutual fund") {
            const ticker = asset.symbol.includes(".") ? asset.symbol : `${asset.symbol}.NS`;
            const { price, previousClose } = await fetchYahooPrice(ticker);
            
            livePrice = price;
            assetMetadata.previousClose = previousClose;

            if (fmpKey) {
              try {
                const fmpQuoteRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${fmpKey}`);
                if (fmpQuoteRes.ok) {
                  const quoteData = await fmpQuoteRes.json();
                  if (quoteData && quoteData.length > 0 && quoteData[0].earningsAnnouncement) {
                    assetMetadata.earningsDate = quoteData[0].earningsAnnouncement;
                  }
                }

                const divRes = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${ticker}?apikey=${fmpKey}`);
                if (divRes.ok) {
                  const divData = await divRes.json();
                  if (divData.historical && divData.historical.length > 0) {
                    const latestDiv = divData.historical[0];
                    if (new Date(latestDiv.date) >= new Date(new Date().setHours(0,0,0,0))) {
                      assetMetadata.exDividendDate = latestDiv.date;
                      assetMetadata.dividendRate = latestDiv.adjDividend || latestDiv.dividend;
                    }
                  }
                }
              } catch (fmpErr) {
                console.error(`Intelligence fetch failed for ${ticker} (non-fatal):`, fmpErr.message);
              }
            }
          }

          // ==========================================
          // 3. COMMODITIES ENGINE (Pure Yahoo Finance)
          // ==========================================
          else if (className === "commodity") {
            const isSilver = type.includes("silver");
            const futuresTicker = isSilver ? "SI=F" : "GC=F";

            const { price: pricePerOunceUSD, previousClose: prevCloseOunceUSD } = await fetchYahooPrice(futuresTicker);

            const pricePerGramUSD = pricePerOunceUSD / 31.1035;
            const prevCloseGramUSD = prevCloseOunceUSD / 31.1035;

            livePrice = pricePerGramUSD * usdInrRate;
            assetMetadata.previousClose = prevCloseGramUSD * usdInrRate;
          }

          // ==========================================
          // COMMIT TO DATABASE
          // ==========================================
          if (livePrice !== null && !isNaN(livePrice)) {
            await sql`
              UPDATE investments 
              SET current_price = ${livePrice}, 
                  metadata = ${JSON.stringify(assetMetadata)},
                  updated_at = NOW() 
              WHERE id = ${asset.id}
            `;
            updatedCount++;
          }
        } catch (fetchErr) {
          console.error(`Failed to sync [${asset.symbol || asset.name}]:`, fetchErr.message);
        }
      }

      return res.status(200).json({ success: true, updated: updatedCount });
    } catch (e) {
      console.error("Master Sync Error:", e);
      return res.status(500).json({ error: "Failed to run synchronization engine." });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
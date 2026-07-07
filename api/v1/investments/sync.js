import { getDb } from "../../../lib/db.js";
import { requireAuth, handleOptions } from "../../../lib/auth.js";

// Yahoo blocks requests with no/blank User-Agent, so we spoof a normal browser UA.
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

// Lightweight, no-auth-required Yahoo endpoint. Good for a single current price.
// Works for equities, ETFs, commodities futures (GC=F, SI=F), forex (USDINR=X),
// and crypto pairs (BTC-INR, ETH-INR, SOL-INR, ...).
async function fetchYahooPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) {
    throw new Error(`Yahoo chart fetch failed for ${symbol}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  if (price === undefined || price === null) {
    throw new Error(`No price returned by Yahoo for ${symbol}`);
  }
  return price;
}

// Best-effort dividend/earnings enrichment via Yahoo's quoteSummary endpoint.
// NOTE: Yahoo increasingly gates this behind a cookie+crumb handshake, so this
// can fail even when the price fetch above succeeds. That's fine -- it's treated
// as optional metadata, never blocks the price update itself.
async function fetchYahooCalendarInfo(symbol) {
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    symbol
  )}?modules=summaryDetail,calendarEvents`;
  const res = await fetch(url, { headers: YAHOO_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.quoteSummary?.result?.[0];
  if (!result) return null;

  const info = {};
  const exDivTs = result.summaryDetail?.exDividendDate?.raw;
  const divRate = result.summaryDetail?.dividendRate?.raw;
  if (exDivTs) info.exDividendDate = new Date(exDivTs * 1000).toISOString().split("T")[0];
  if (divRate !== undefined) info.dividendRate = divRate;

  const earningsTs = result.calendarEvents?.earnings?.earningsDate?.[0]?.raw;
  if (earningsTs) info.earningsDate = new Date(earningsTs * 1000).toISOString().split("T")[0];

  return info;
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
        SELECT id, symbol, asset_type,asset_class, name, metadata 
        FROM investments 
        WHERE user_id = ${uid} 
        AND asset_class IN ('market', 'commodity')
      `;

      let updatedCount = 0;

      // PRE-FETCH FOREX: live USD/INR rate, used for all commodity (USD-quoted) conversions
      let usdInrRate = 83.5; // Fallback rate
      try {
        usdInrRate = await fetchYahooPrice("USDINR=X");
      } catch (e) {
        console.error("Failed to fetch USD/INR rate from Yahoo, using fallback:", e.message);
      }

      for (const asset of assets) {
        let livePrice = null;
        let assetMetadata =
          typeof asset.metadata === "string" ? JSON.parse(asset.metadata) : asset.metadata || {};

        try {
          // ==========================================
          // 1. CRYPTO ENGINE (Yahoo, direct INR pairs)
          // ==========================================
          if (asset.asset_type.toLowerCase() === "crypto" || asset.name.toLowerCase().includes("bitcoin")) {
            let base = asset.symbol;
            if (asset.name.toLowerCase().includes("bitcoin")) base = "BTC";
            else if (asset.name.toLowerCase().includes("ethereum")) base = "ETH";
            else if (asset.name.toLowerCase().includes("solana")) base = "SOL";

            const yahooSymbol = `${base}-INR`;
            livePrice = await fetchYahooPrice(yahooSymbol);
          }

          // ==========================================
          // 2. STOCKS & ETFs ENGINE (Yahoo)
          // ==========================================
          else if (
            asset.asset_type.toLowerCase() === "stock" ||
            asset.asset_type.toLowerCase() === "etf" ||
            asset.asset_type.toLowerCase() === "mutual fund"
          ) {
            const ticker = asset.symbol.includes(".") ? asset.symbol : `${asset.symbol}.NS`;

            livePrice = await fetchYahooPrice(ticker);

            // Best-effort: dividend/earnings metadata. Never throws past this point.
            try {
              const calInfo = await fetchYahooCalendarInfo(ticker);
              if (calInfo) {
                if (calInfo.earningsDate) assetMetadata.earningsDate = calInfo.earningsDate;
                if (calInfo.exDividendDate && new Date(calInfo.exDividendDate) >= new Date()) {
                  assetMetadata.exDividendDate = calInfo.exDividendDate;
                  assetMetadata.dividendRate = calInfo.dividendRate;
                }
              }
            } catch (calErr) {
              console.error(`Calendar info fetch failed for ${ticker} (non-fatal):`, calErr.message);
            }
          }

          // ==========================================
          // 3. COMMODITIES ENGINE (Gold/Silver via Yahoo futures)
          // ==========================================
          else if (asset.asset_class === "commodity") {
            const isSilver = asset.asset_type.toLowerCase().includes("silver");
            const futuresTicker = isSilver ? "SI=F" : "GC=F"; // COMEX Silver / Gold futures, USD per troy ounce

            const pricePerOunceUSD = await fetchYahooPrice(futuresTicker);

            // Convert Troy Ounces to Grams (1 Troy Ounce = 31.1035 grams)
            const pricePerGramUSD = pricePerOunceUSD / 31.1035;
            const pricePerGramINR = pricePerGramUSD * usdInrRate;

            // we use per gram price
            livePrice = pricePerGramINR;
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
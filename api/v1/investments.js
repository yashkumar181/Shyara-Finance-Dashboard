import { getDb } from "../../lib/db.js";
import { requireAuth, handleOptions } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const auth = await requireAuth(req, res);
  if (!auth) return;

  const sql = getDb();
  const uid = auth.dbUserId;

  const fetchLiveAssetData = async (symbol, type) => {
    try {
      if (type === 'mf') {
        const mfRes = await fetch(`https://api.mfapi.in/mf/${symbol}`);
        const mfData = await mfRes.json();
        if (mfData.data && mfData.data.length > 0) {
          return { price: parseFloat(mfData.data[0].nav), beta: 1.0, yield: 0 };
        }
      } else if (type === 'stock') {
        let fetchSymbol = symbol.trim().toUpperCase();
        if (!fetchSymbol.includes('.')) fetchSymbol += '.NS';

        const yfRes = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${fetchSymbol}`);
        const yfData = await yfRes.json();
        if (yfData.quoteResponse?.result?.length > 0) {
          const data = yfData.quoteResponse.result[0];
          return {
            price: parseFloat(data.regularMarketPrice || 0),
            beta: parseFloat(data.beta || 1.0),
            yield: parseFloat(data.trailingAnnualDividendYield || 0)
          };
        }
      }
    } catch (e) { console.error("Fetch data error for", symbol, e); }
    return null;
  };

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get("action") || (req.query && req.query.action);

  if (req.method === "GET") {
    try {
      const rows = await sql`SELECT * FROM investments WHERE user_id = ${uid} ORDER BY current_price * quantity DESC`;
      return res.status(200).json(rows);
    } catch (e) { return res.status(500).json({ error: "Failed to fetch" }); }
  }

  if (req.method === "POST" && action === "sync") {
    try {
      const assets = await sql`SELECT id, ticker_symbol, asset_type FROM investments WHERE user_id = ${uid}`;
      for (const asset of assets) {
        const liveData = await fetchLiveAssetData(asset.ticker_symbol, asset.asset_type);
        if (liveData && liveData.price > 0) {
          await sql`UPDATE investments SET current_price = ${liveData.price}, beta = ${liveData.beta}, dividend_yield = ${liveData.yield}, last_synced_at = CURRENT_TIMESTAMP WHERE id = ${asset.id}`;
        }
      }
      const updatedRows = await sql`SELECT * FROM investments WHERE user_id = ${uid} ORDER BY current_price * quantity DESC`;
      return res.status(200).json(updatedRows);
    } catch (e) { return res.status(500).json({ error: "Sync failed" }); }
  }

  if (req.method === "POST") {
    const { name, ticker_symbol, asset_type, quantity, average_buy_price } = req.body;
    try {
      const parsedQty = parseFloat(quantity);
      const parsedBuy = parseFloat(average_buy_price);
      
      const liveData = await fetchLiveAssetData(ticker_symbol, asset_type);
      let initialPrice = liveData?.price || parsedBuy;
      let initialBeta = liveData?.beta || 1.0;
      let initialYield = liveData?.yield || 0.0;
      
      let formattedSymbol = ticker_symbol.trim().toUpperCase();
      if (asset_type === 'stock' && !formattedSymbol.includes('.')) formattedSymbol += '.NS';

      const rows = await sql`
        INSERT INTO investments (user_id, name, ticker_symbol, asset_type, quantity, average_buy_price, current_price, beta, dividend_yield)
        VALUES (${uid}, ${name}, ${formattedSymbol}, ${asset_type}, ${parsedQty}, ${parsedBuy}, ${initialPrice}, ${initialBeta}, ${initialYield})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    } catch (e) { return res.status(500).json({ error: "Creation failed" }); }
  }

  if (req.method === "DELETE") {
    try {
      const id = url.searchParams.get("id") || (req.query && req.query.id);
      await sql`DELETE FROM investments WHERE id = ${id} AND user_id = ${uid}`;
      return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: "Deletion failed" }); }
  }
}
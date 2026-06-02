import React, { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Repeat, TrendingUp, CalendarClock, Sparkles, Plus, LayoutGrid, Loader2, ShieldCheck, X } from "lucide-react";
import { useApi } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

export default function Subscriptions() {
  const api = useApi();
  const { subscriptions, setSubscriptions } = useAppStore();
  
  const [saved, setSaved] = useState([]);
  const [detected, setDetected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(new Set());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ merchant: '', amount: '', frequency: 'monthly', category: 'Entertainment', nextExpected: '' });

  const loadData = async (rescan = false) => {
    if (rescan) setScanning(true); else setLoading(true);
    try {
      const data = await api.getSubscriptions();
      setSaved(data.saved || []);
      setDetected(data.detected || []);
      setSubscriptions(data.saved || []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); setScanning(false); }
  };

  useEffect(() => { loadData(); }, []);

  const withBusy = async (id, fn) => {
    setBusy(b => new Set(b).add(id));
    try { await fn(); } finally { setBusy(b => { const s = new Set(b); s.delete(id); return s; }); }
  };

  const confirmDetected = (item) => withBusy(item.merchant, async () => {
    const savedItem = await api.confirmSubscription({ ...item, status: 'confirmed' });
    setSaved(prev => [savedItem, ...prev]);
    setDetected(prev => prev.filter(d => d.merchant !== item.merchant));
  });

  const deleteItem = (item) => withBusy(item.id, async () => {
    await api.deleteSubscription(item.id);
    setSaved(prev => prev.filter(s => s.id !== item.id));
  });

  const handleManualAdd = async (e) => {
    e.preventDefault();
    withBusy('manual-add', async () => {
      const savedItem = await api.confirmSubscription({
        merchant: newSub.merchant,
        amount: parseFloat(newSub.amount),
        frequency: newSub.frequency,
        category: newSub.category,
        nextExpected: newSub.nextExpected || new Date().toISOString().split('T')[0],
        confidence: 100, // Manually added, so 100% confidence
        status: 'confirmed'
      });
      setSaved(prev => [savedItem, ...prev]);
      setIsModalOpen(false);
      setNewSub({ merchant: '', amount: '', frequency: 'monthly', category: 'Entertainment', nextExpected: '' });
    });
  };

  const monthlyTotal = saved.filter(i => i.status === 'confirmed').reduce((sum, i) => {
    const mult = { weekly: 4, monthly: 1, quarterly: 1/3, annual: 1/12 };
    return sum + (parseFloat(i.amount) * (mult[i.frequency] || 1));
  }, 0);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 pb-28">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A] dark:text-gray-200">
            <Repeat className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Subscription Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-detected patterns and auto-billing ledger.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-[#0A3D8B] text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Custom
          </button>
          <button onClick={() => loadData(true)} disabled={scanning} className="flex items-center px-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-lg text-xs font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? "animate-spin" : ""}`} /> {scanning ? "Scanning..." : "Force AI Scan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><CalendarClock className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Subs</p><p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">{saved.length}</p></div>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Cost</p><p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{Math.round(monthlyTotal).toLocaleString('en-IN')}</p></div>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${detected.length > 0 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' : 'bg-[#F8F9FA] dark:bg-[#121212] border-gray-200 dark:border-[#262626]'}`}>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Sparkles className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Detected</p><p className="text-2xl font-bold text-amber-600">{detected.length}</p></div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Detected Subscriptions */}
        {detected.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-4 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Needs Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {detected.map((item, i) => (
                <div key={i} className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-amber-200 dark:border-amber-800/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Detected</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center text-lg">{item.icon}</div>
                    <div><p className="font-bold text-[#0F172A] dark:text-gray-200">{item.merchant}</p><p className="text-xs text-gray-500">{item.category}</p></div>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{item.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{item.frequency} · {item.occurrences} historical charges</p>
                  </div>
                  <button onClick={() => confirmDetected(item)} disabled={busy.has(item.merchant)} className="w-full flex items-center justify-center px-4 py-2 bg-[#0A3D8B] text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors">
                    {busy.has(item.merchant) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm & Auto-Bill</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Subscriptions */}
        <div>
           <h3 className="text-sm font-bold text-[#0F172A] dark:text-gray-200 mb-4 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Active Auto-Billing</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {saved.map((item) => (
                <div key={item.id} className="bg-[#F8F9FA] dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] flex items-center justify-center text-lg">{item.icon || '💳'}</div>
                      <div><p className="font-bold text-[#0F172A] dark:text-gray-200">{item.merchant}</p><p className="text-xs text-gray-500 capitalize">{item.frequency || 'Monthly'}</p></div>
                    </div>
                    <button onClick={() => deleteItem(item)} disabled={busy.has(item.id)} className="text-gray-400 hover:text-red-500"><XCircle className="w-5 h-5" /></button>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{parseFloat(item.amount).toLocaleString('en-IN')}</p>
                  {item.next_expected && <p className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">Next Charge: {new Date(item.next_expected).toLocaleDateString()}</p>}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-[#262626]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Add Subscription</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
                <input type="text" required placeholder="e.g. Spotify" value={newSub.merchant} onChange={e => setNewSub({...newSub, merchant: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                  <input type="number" required placeholder="119" value={newSub.amount} onChange={e => setNewSub({...newSub, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                  <select value={newSub.frequency} onChange={e => setNewSub({...newSub, frequency: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500">
                    <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Next Billing Date</label>
                <input type="date" required value={newSub.nextExpected} onChange={e => setNewSub({...newSub, nextExpected: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500" />
              </div>
              <button type="submit" disabled={busy.has('manual-add')} className="w-full mt-4 bg-[#0A3D8B] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-blue-800 flex justify-center items-center">
                {busy.has('manual-add') ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Enable Auto-Billing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Repeat, TrendingUp, CalendarClock, Sparkles, Plus, Loader2, ShieldCheck, X } from "lucide-react";
import { useApi } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

export default function Subscriptions() {
  const api = useApi();
  const { subscriptions, setSubscriptions, accounts } = useAppStore();
  
  const [saved, setSaved] = useState([]);
  const [detected, setDetected] = useState([]);
  
  // Optimistic Caching States
  const [loading, setLoading] = useState(() => !localStorage.getItem('shyara_subs_saved_cache'));
  const [scanning, setScanning] = useState(false);
  const [isSilentlyRefreshing, setIsSilentlyRefreshing] = useState(false);
  const [busy, setBusy] = useState(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // CHANGED: Added state for the deletion confirmation modal
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [newSub, setNewSub] = useState({ merchant: '', amount: '', frequency: 'monthly', category: 'Entertainment', nextExpected: '', accountId: '' });

  const loadData = async (rescan = false) => {
    if (rescan) setScanning(true);
    
    // 1. Instantly load from local browser cache if available
    if (!rescan) {
      const cachedSaved = localStorage.getItem('shyara_subs_saved_cache');
      const cachedDetected = localStorage.getItem('shyara_subs_detected_cache');
      if (cachedSaved) {
        setSaved(JSON.parse(cachedSaved));
        setSubscriptions(JSON.parse(cachedSaved));
        if (cachedDetected) setDetected(JSON.parse(cachedDetected));
        setLoading(false);
        setIsSilentlyRefreshing(true); // Trigger the tiny background spinner
      } else {
        setLoading(true);
      }
    }

    // 2. Fetch fresh data from the AI Database
    try {
      const data = await api.getSubscriptions();
      setSaved(data.saved || []);
      setDetected(data.detected || []);
      setSubscriptions(data.saved || []);
      
      // 3. Update the cache for next time
      localStorage.setItem('shyara_subs_saved_cache', JSON.stringify(data.saved || []));
      localStorage.setItem('shyara_subs_detected_cache', JSON.stringify(data.detected || []));
    } catch (e) { console.error(e); } 
    finally { setLoading(false); setScanning(false); setIsSilentlyRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const withBusy = async (id, fn) => {
    setBusy(b => new Set(b).add(id));
    try { await fn(); } finally { setBusy(b => { const s = new Set(b); s.delete(id); return s; }); }
  };

  const confirmDetected = (item) => withBusy(item.merchant, async () => {
    const savedItem = await api.confirmSubscription({ ...item, status: 'confirmed' });
    const newSaved = [savedItem, ...saved];
    const newDetected = detected.filter(d => d.merchant !== item.merchant);
    
    setSaved(newSaved);
    setDetected(newDetected);
    localStorage.setItem('shyara_subs_saved_cache', JSON.stringify(newSaved));
    localStorage.setItem('shyara_subs_detected_cache', JSON.stringify(newDetected));
  });

  // CHANGED: Now executes the actual deletion after confirmation
  const executeDelete = (item) => withBusy(item.id, async () => {
    await api.deleteSubscription(item.id);
    const newSaved = saved.filter(s => s.id !== item.id);
    setSaved(newSaved);
    localStorage.setItem('shyara_subs_saved_cache', JSON.stringify(newSaved));
    setItemToDelete(null); // Close the modal after deletion
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
        confidence: 100, 
        status: 'confirmed',
        accountId: parseInt(newSub.accountId)
      });
      const newSaved = [savedItem, ...saved];
      setSaved(newSaved);
      localStorage.setItem('shyara_subs_saved_cache', JSON.stringify(newSaved));
      
      setIsModalOpen(false);
      setNewSub({ merchant: '', amount: '', frequency: 'monthly', category: 'Entertainment', nextExpected: '', accountId: '' });
    });
  };

  const monthlyTotal = saved.filter(i => i.status === 'confirmed').reduce((sum, i) => {
    const mult = { weekly: 4, monthly: 1, quarterly: 1/3, annual: 1/12 };
    return sum + (parseFloat(i.amount) * (mult[i.frequency] || 1));
  }, 0);

  if (loading) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse flex items-center space-x-3 text-purple-600 font-bold tracking-widest uppercase text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading Subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 pb-28">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#0F172A] dark:text-gray-200">
            <Repeat className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Subscription Manager
            {isSilentlyRefreshing && <RefreshCw className="w-4 h-4 text-purple-500 animate-spin opacity-50" />}
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
                    {/* CHANGED: Opens the confirmation modal instead of deleting immediately */}
                    <button onClick={() => setItemToDelete(item)} disabled={busy.has(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle className="w-5 h-5" /></button>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{parseFloat(item.amount).toLocaleString('en-IN')}</p>
                  {item.next_expected && <p className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">Next Charge: {new Date(item.next_expected).toLocaleDateString()}</p>}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* CHANGED: New Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#262626]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Delete Subscription?</h2>
              <button onClick={() => setItemToDelete(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-[#0F172A] dark:text-white">{itemToDelete.merchant}</span>? This will immediately stop auto-billing for this service.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={() => executeDelete(itemToDelete)} disabled={busy.has(itemToDelete.id)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center transition-colors">
                {busy.has(itemToDelete.id) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select required value={newSub.accountId} onChange={e => setNewSub({...newSub, accountId: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500">
                  <option value="" disabled>Select Account to Charge</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nickname || acc.account_category} (₹{parseFloat(acc.balance).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
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
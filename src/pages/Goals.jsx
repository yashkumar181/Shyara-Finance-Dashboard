import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Target, Plus, Trash2, Award, History, X, ArrowRight, TrendingUp, CheckCircle2, Home } from 'lucide-react';
import { useApi } from '../lib/api';
import { useAppStore } from '../store/useAppStore';

// Map string names to Lucide icons
const iconMap = { Target, Home, Award, TrendingUp, CheckCircle2 }; 

const Goals = () => {
  const api = useApi();
  const { goals, setGoals, goalsLoading, setGoalsLoading } = useAppStore(); 

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [selectedGoalForFunds, setSelectedGoalForFunds] = useState(null);
  const [selectedGoalDetails, setSelectedGoalDetails] = useState(null);

  const [newGoal, setNewGoal] = useState({ name: '', target: '', priority: 'Medium', deadline: '' });
  const [fundAmount, setFundAmount] = useState('');

  const loadGoals = async () => {
    if (!useAppStore.getState().goals) {
      setGoalsLoading(true);
    }
    try {
      const data = await api.getGoals();
      setGoals(data.map(g => ({
        ...g,
        history: [] 
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [api, setGoals, setGoalsLoading]);

  const safeGoals = goals || [];

  const totalTarget = safeGoals.reduce((sum, g) => sum + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = safeGoals.reduce((sum, g) => sum + (parseFloat(g.current_amount) || 0), 0);
  const accomplishedCount = safeGoals.filter(g => parseFloat(g.current_amount) >= parseFloat(g.target_amount)).length;

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await api.createGoal({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target),
        current_amount: 0,
        priority: newGoal.priority,
      });
      await loadGoals();
      setIsAddGoalOpen(false);
      setNewGoal({ name: '', target: '', priority: 'Medium', deadline: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals(safeGoals.filter(g => g.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    setGoals(safeGoals.map(g => g.id === id ? { ...g, priority: newPriority } : g));
    try {
      await api.updateGoal({ id, priority: newPriority });
    } catch (error) {
      console.error(error);
      loadGoals();
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) return;

    const newTotal = parseFloat(selectedGoalForFunds.current_amount) + amount;

    try {
      await api.updateGoal({ id: selectedGoalForFunds.id, current_amount: newTotal });
      setGoals(safeGoals.map(g => {
        if (g.id === selectedGoalForFunds.id) {
          return {
            ...g, 
            current_amount: Math.min(newTotal, g.target_amount),
            history: [{ id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), amount }, ...g.history]
          };
        }
        return g;
      }));
      setIsAddFundsOpen(false);
      setFundAmount('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200 mb-1">Strategic Goals</h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Map and fund your future milestones.</p>
        </div>
        <button onClick={() => setIsAddGoalOpen(true)} className="flex items-center px-4 py-2 bg-[#0A3D8B] dark:bg-[#262626] text-white rounded-lg text-xs font-semibold hover:bg-[#082f6b] dark:hover:bg-[#333] transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Create New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] transition-all">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Total Target Capital</p>
          <h3 className="text-3xl font-bold text-[#0F172A] dark:text-gray-200">₹{totalTarget.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] transition-all">
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Capital Secured</p>
          <h3 className="text-3xl font-bold text-[#0A3D8B] dark:text-blue-400">₹{totalSaved.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-[#F8F9FA] dark:bg-[#121212] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#262626] flex items-center justify-between transition-all">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Goals Accomplished</p>
            <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{accomplishedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {(goalsLoading && !goals) ? (
        <div className="py-20 text-center text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing strategic targets...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {safeGoals.map(goal => {
            const isComplete = parseFloat(goal.current_amount) >= parseFloat(goal.target_amount);
            const rawPercentage = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
            const percentage = Math.min(rawPercentage, 100).toFixed(1);
            const numPercentage = parseFloat(percentage);

            let progressColor = 'bg-[#0A3D8B] dark:bg-gray-500'; 
            if (isComplete) progressColor = 'bg-yellow-500';
            else if (numPercentage >= 80) progressColor = 'bg-emerald-500';
            else if (numPercentage < 40) progressColor = 'bg-red-500';
            else progressColor = 'bg-[#0A3D8B] dark:bg-blue-500'; 

            let priorityClass = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
            if (goal.priority === 'High') priorityClass = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
            if (goal.priority === 'Medium') priorityClass = 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';

            return (
              <div key={goal.id} className={`p-6 md:p-8 rounded-2xl shadow-sm border transition-all flex flex-col justify-between ${isComplete ? 'bg-gradient-to-br from-[#FFFDF0] to-white dark:from-[#2A2410] dark:to-[#121212] border-yellow-300 dark:border-yellow-700/50' : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-[#262626]'}`}>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isComplete ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500' : 'bg-gray-100 dark:bg-[#262626] text-[#0A3D8B] dark:text-gray-300'}`}>
                        {isComplete ? <Award className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isComplete ? 'text-yellow-800 dark:text-yellow-500' : 'text-[#0F172A] dark:text-gray-200'}`}>{goal.name}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          {isComplete ? (
                            <span className="text-[9px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded uppercase tracking-widest flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> ACHIEVED</span>
                          ) : (
                            <select 
                              value={goal.priority || 'Medium'}
                              onChange={(e) => handlePriorityChange(goal.id, e.target.value)}
                              className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-transparent dark:border-[#262626] appearance-none cursor-pointer outline-none text-center ${priorityClass}`}
                            >
                              <option value="High">HIGH PRIORITY</option>
                              <option value="Medium">MEDIUM PRIORITY</option>
                              <option value="Low">LOW PRIORITY</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500 dark:text-[#a3a3a3] dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626]"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <h2 className={`text-3xl font-bold ${isComplete ? 'text-yellow-700 dark:text-yellow-500' : 'text-[#0F172A] dark:text-gray-200'}`}>₹{parseFloat(goal.current_amount).toLocaleString('en-IN')}</h2>
                      <p className={`text-[11px] font-bold uppercase tracking-widest ${isComplete ? 'text-yellow-600 dark:text-yellow-600/80' : 'text-gray-500 dark:text-[#a3a3a3]'}`}>OF ₹{parseFloat(goal.target_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isComplete ? 'bg-yellow-200 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-[#0a0a0a]'}`}>
                      <div className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className={`text-xs font-bold mt-2 ${isComplete ? 'text-yellow-700 dark:text-yellow-600' : 'text-gray-500 dark:text-[#a3a3a3]'}`}>{percentage}% Funded</p>
                  </div>
                </div>

                <div className="flex space-x-3 border-t border-gray-100 dark:border-[#262626] pt-4 mt-auto">
                  {!isComplete && (
                    <button onClick={() => { setSelectedGoalForFunds(goal); setIsAddFundsOpen(true); }} className="flex-1 flex items-center justify-center py-2.5 bg-[#F0F5FF] dark:bg-[#1A2235] text-[#0A3D8B] dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-50 dark:hover:bg-[#202A40] transition-colors border border-transparent dark:border-[#262626]">
                      <TrendingUp className="w-4 h-4 mr-2" /> Add Funds
                    </button>
                  )}
                  <button onClick={() => setSelectedGoalDetails(goal)} className="flex-1 flex items-center justify-center py-2.5 bg-gray-50 dark:bg-[#121212] text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors border border-gray-200 dark:border-[#262626]">
                    <History className="w-4 h-4 mr-2" /> View Details
                  </button>
                </div>
              </div>
            )
          })}
          
          {safeGoals.length === 0 && (
             <div className="col-span-2 text-center py-20 border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-2xl text-gray-500">
               No strategic goals set. Click "New Target" to begin planning.
             </div>
          )}
        </div>
      )}

      {isAddGoalOpen && createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddGoalOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 z-10 w-full max-w-md bg-[#F8F9FA] dark:bg-[#121212] border-l border-gray-200 dark:border-[#262626] shadow-2xl flex flex-col animate-fade-slide-up">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">New Goal</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Define your next milestone</p>
              </div>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="goal-form" onSubmit={handleAddGoal} className="p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Goal Name</label>
                  <input required type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Target Amount (₹)</label>
                  <input required type="number" step="1" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none dark:text-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Priority Level</label>
                    <select value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none dark:text-gray-200">
                      <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Target Deadline</label>
                    <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-sm font-semibold rounded-xl focus:outline-none dark:text-gray-200" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
              <button type="submit" form="goal-form" className="w-full flex items-center justify-center py-3.5 bg-[#0A3D8B] dark:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-lg">Initialize Goal <ArrowRight className="w-4 h-4 ml-2" /></button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isAddFundsOpen && selectedGoalForFunds && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddFundsOpen(false)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">Contribute Funds</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] font-bold tracking-widest uppercase mt-1">To: {selectedGoalForFunds.name}</p>
              </div>
              <button onClick={() => setIsAddFundsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddFunds}>
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2">Amount to Add (₹)</label>
                <input required autoFocus type="number" step="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="w-full px-4 py-4 text-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] text-[#0F172A] dark:text-gray-200 font-bold rounded-xl focus:outline-none" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg flex items-center justify-center">
                Confirm Transfer <TrendingUp className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedGoalDetails && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGoalDetails(null)}></div>
          <div className="bg-[#F8F9FA] dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl relative z-10 border border-gray-200 dark:border-[#262626] overflow-hidden animate-fade-slide-up flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#262626] flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-gray-200">{selectedGoalDetails.name}</h2>
                <p className="text-[10px] text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mt-0.5">Contribution Log</p>
              </div>
              <button onClick={() => setSelectedGoalDetails(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-200 dark:border-[#262626] mb-6 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Current Balance</p>
                  <h3 className="text-2xl font-bold text-[#0F172A] dark:text-gray-200">₹{parseFloat(selectedGoalDetails.current_amount).toLocaleString('en-IN')}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-1">Target</p>
                  <h3 className="text-lg font-bold text-gray-400 dark:text-gray-600">₹{parseFloat(selectedGoalDetails.target_amount).toLocaleString('en-IN')}</h3>
                </div>
              </div>
              <h4 className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] tracking-widest uppercase mb-4">Past Contributions</h4>
              {selectedGoalDetails.history && selectedGoalDetails.history.length > 0 ? (
                <div className="space-y-3">
                  {selectedGoalDetails.history.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-[#262626]">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mr-3">
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-[#0F172A] dark:text-gray-300">{entry.date}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹{entry.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-[#a3a3a3] text-center py-6">No contributions yet.</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Goals;
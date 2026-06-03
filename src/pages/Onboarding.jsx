import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/api';
import { Loader2, ArrowRight, ShieldCheck, User, Phone } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const { user } = useUser();
  const api = useApi();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number.');
      setLoading(false);
      return;
    }

    try {
      await user.update({
        unsafeMetadata: { phone: formData.phone }
      });

      await api.syncUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      onComplete();
    } catch (err) {
      console.error("Setup Error:", err);
      setError(err.message || 'Failed to setup your account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        
        <div className="bg-[#0A3D8B] p-8 text-white text-center relative">
           <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-90" />
           <h2 className="text-2xl font-bold tracking-wide">Secure Setup</h2>
           <p className="text-xs text-blue-200 mt-2 leading-relaxed">Complete your profile to securely encrypt and sync your financial ledger.</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg text-xs font-bold">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Last Name</label>
                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg px-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input required type="tel" placeholder="919876543210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0F172A] dark:text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-[#0A3D8B] hover:bg-blue-800 text-white font-bold py-3 rounded-lg text-sm flex justify-center items-center shadow-md transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="mr-2">Initialize Dashboard</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/api';
import { Loader2 } from 'lucide-react';
import Onboarding from '../pages/Onboarding';

export default function AuthGuard({ children }) {
  const { isLoaded, user } = useUser();
  const api = useApi();
  const [isVerified, setIsVerified] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const verifyUser = async () => {
      try {
        if (!user.unsafeMetadata?.phone) {
          setNeedsOnboarding(true);
          return;
        }

        try {
          await api.getUser();
          setIsVerified(true);
        } catch (err) {
          if (err.message.includes('not found') || err.message.includes('404')) {
            // Auto-sync if Clerk has phone but DB is missing it
            await api.syncUser({
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.unsafeMetadata.phone
            });
            setIsVerified(true);
          } else {
            throw err;
          }
        }
      } catch (error) {
        console.error("AuthGuard Error:", error);
        setNeedsOnboarding(true);
      }
    };

    verifyUser();
  }, [isLoaded, user, api]);

  if (!isLoaded || (!isVerified && !needsOnboarding)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0a0a0a]">
         <div className="flex flex-col items-center">
           <Loader2 className="w-8 h-8 animate-spin text-[#0A3D8B] dark:text-blue-500 mb-4" />
           <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Securing Connection...</p>
         </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={() => {
       setNeedsOnboarding(false);
       setIsVerified(true);
    }} />;
  }

  return children;
}
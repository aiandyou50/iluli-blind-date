'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect } from 'react';

export default function MatchingPage() {
  const t = useTranslations('swipe');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState(false);
  
  // Mock user ID
  const currentUserId = 'user-id-placeholder';

  useEffect(() => {
    fetch(`/api/matches/candidates?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAction = async (action: 'like' | 'pass') => {
    if (currentIndex >= candidates.length) return;
    
    const targetUser = candidates[currentIndex];
    
    // Optimistic update
    setCurrentIndex(prev => prev + 1);

    try {
      const res = await fetch('/api/matches/action', {
        method: 'POST',
        body: JSON.stringify({
          fromUserId: currentUserId,
          toUserId: targetUser.id,
          action
        })
      });
      
      const data = await res.json() as { match: boolean };
      if (data.match) {
        setMatchAlert(true);
        setTimeout(() => setMatchAlert(false), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const currentProfile = candidates[currentIndex];

  return (
    <>
      <Header title={t('like')} />
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 pb-24 relative">
        {matchAlert && (
          <div className="absolute top-10 z-50 bg-pink-500 text-white px-8 py-4 rounded-full shadow-lg animate-bounce font-bold text-xl">
            {t('itsAMatch')}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : !currentProfile ? (
          <div className="text-center text-gray-500">
            <p>{t('noMoreProfiles')}</p>
          </div>
        ) : (
          <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-96 bg-gray-200">
              {currentProfile.photos?.[0]?.url ? (
                <img 
                  src={currentProfile.photos[0].url} 
                  alt={currentProfile.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h2 className="text-2xl font-bold">{currentProfile.nickname || currentProfile.name}</h2>
                <p className="text-sm opacity-90">{currentProfile.bio || 'No bio'}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 p-6">
              <button 
                onClick={() => handleAction('pass')}
                className="w-16 h-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleAction('like')}
                className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center hover:bg-pink-200 transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

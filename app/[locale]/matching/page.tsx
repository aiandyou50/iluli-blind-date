'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function MatchingPage() {
  const t = useTranslations('swipe');
  const { data: session } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (!currentUserId) return;

    fetch(`/api/matches/candidates?userId=${currentUserId}`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) {
          // Session might be invalid on server side even if client side thinks it's valid
          console.error("Server returned 401 Unauthorized");
          setError("Authentication failed. Please try logging in again.");
          return [];
        }
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load candidates.");
        setLoading(false);
      });
  }, [currentUserId]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="rounded-full bg-primary px-6 py-2 text-white"
        >
          Go to Login
        </button>
        <BottomNav />
      </div>
    );
  }

  const handleAction = async (action: 'like' | 'pass') => {
    if (currentIndex >= candidates.length) return;
    
    const targetUser = candidates[currentIndex];
    
    // Optimistic update
    setCurrentIndex(prev => prev + 1);

    try {
      if (!targetUser.photos?.[0]?.id) return;

      await fetch('/api/matches/action', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUserId,
          photoId: targetUser.photos[0].id,
          action
        })
      });
      
    } catch (error) {
      console.error(error);
    }
  };

  const currentProfile = candidates[currentIndex];

  return (
    <>
      <Header title={t('like')} />
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 pb-24 relative">

        {loading ? (
          <div>Loading...</div>
        ) : !currentProfile ? (
          <div className="text-center text-gray-500">
            <p>{t('noMoreProfiles')}</p>
          </div>
        ) : (
          <div className="w-full max-w-sm md:max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
            <div className="relative h-96 md:h-[500px] bg-gray-200">
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
                <p className="text-sm opacity-90">{currentProfile.introduction || 'No introduction'}</p>
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
                onClick={() => router.push(`/profile/${currentProfile.id}`)}
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

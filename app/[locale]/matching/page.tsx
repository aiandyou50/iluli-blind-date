'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';

// [EN] User verification status types / [KR] 사용자 인증 상태 타입
type VerificationStatus = 'PENDING' | 'VERIFYING' | 'ACTIVE';

interface Candidate {
  id: string;
  nickname?: string;
  name?: string;
  school?: string;
  age?: number;
  introduction?: string;
  photos?: { id: string; url: string }[];
}

export default function MatchingPage() {
  const t = useTranslations('swipe');
  const tCommon = useTranslations('common');
  const { data: session, status: sessionStatus } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchPopup, setMatchPopup] = useState<{ name: string; instagramId?: string } | null>(null);
  
  // [EN] Mock verification status - in production, fetch from API / [KR] 목업 인증 상태 - 프로덕션에서는 API에서 가져옴
  const [verificationStatus] = useState<VerificationStatus>('ACTIVE');
  const [verificationCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  
  const currentUserId = session?.user?.id;

  const fetchCandidates = useCallback(() => {
    if (!currentUserId) return;

    setLoading(true);
    fetch(`/api/matches/candidates?userId=${currentUserId}`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          console.error("Server returned 401 Unauthorized", data);
          setError(`${t('authError')}: ${JSON.stringify(data, null, 2)}`);
          return [];
        }
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setCandidates(Array.isArray(data) ? data : []);
        setCurrentIndex(0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(t('loadError'));
        setLoading(false);
      });
  }, [currentUserId, t]);

  useEffect(() => {
    if (currentUserId) {
      fetchCandidates();
    }
  }, [currentUserId, fetchCandidates]);

  // [EN] Keyboard navigation support for PC / [KR] PC용 키보드 네비게이션 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (verificationStatus !== 'ACTIVE') return;
      if (currentIndex >= candidates.length) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAction('pass');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAction('like');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, candidates.length, verificationStatus]);

  const handleAction = async (action: 'like' | 'pass') => {
    if (currentIndex >= candidates.length) return;
    
    const targetUser = candidates[currentIndex];
    
    // [EN] Optimistic update / [KR] 낙관적 업데이트
    setCurrentIndex(prev => prev + 1);

    try {
      // [EN] Build request body - prefer targetUserId, fallback to photoId
      // [KR] 요청 본문 구성 - targetUserId 우선, photoId로 폴백
      const body: { targetUserId?: string; photoId?: string; action: string } = { action };
      
      if (targetUser.id) {
        body.targetUserId = targetUser.id;
      } else if (targetUser.photos?.[0]?.id) {
        body.photoId = targetUser.photos[0].id;
      } else {
        console.error("Cannot perform action: no targetUserId or photoId available");
        return;
      }

      const res = await fetch('/api/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json() as { isMatch?: boolean; instagramId?: string };
      
      // [EN] Show match popup if matched / [KR] 매칭되면 팝업 표시
      if (data.isMatch) {
        setMatchPopup({
          name: targetUser.nickname || targetUser.name || 'Unknown',
          instagramId: data.instagramId
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/matches/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      fetchCandidates();
    } catch (error) {
      console.error(error);
    }
  };

  // [EN] State A: Not verified - Show lock screen / [KR] 상태 A: 미인증 - 잠금 화면 표시
  const UnverifiedState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-gray-400">lock</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('verificationRequired')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{t('verificationRequiredDesc')}</p>
      <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-pink-200 dark:shadow-pink-900/30 hover:opacity-90 transition-opacity">
        {t('requestVerification')}
      </button>
    </div>
  );

  // [EN] State B: Verifying - Show verification code / [KR] 상태 B: 인증 중 - 인증 코드 표시
  const VerifyingState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-zinc-700">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-purple-600">verified</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('verificationInProgress')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('sendCodeToAdmin')}</p>
        
        {/* [EN] Verification Code Display / [KR] 인증 코드 표시 */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">{t('yourCode')}</p>
          <p className="text-4xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
            {verificationCode}
          </p>
        </div>
        
        <a
          href="https://instagram.com/iluli_dating"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {t('sendInstagramDM')}
        </a>
      </div>
    </div>
  );

  // [EN] Error state / [KR] 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-red-500">error</span>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="rounded-2xl bg-pink-500 px-6 py-3 text-white font-semibold hover:bg-pink-600 transition-colors"
          >
            {t('goToLogin')}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // [EN] Loading state / [KR] 로딩 상태
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentProfile = candidates[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      
      {/* [EN] Match Popup / [KR] 매칭 팝업 */}
      {matchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-white">favorite</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('itsAMatch')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('matchedWithUser', { name: matchPopup.name })}
            </p>
            {matchPopup.instagramId && (
              <a
                href={`https://instagram.com/${matchPopup.instagramId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity mb-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t('sendDM')}
              </a>
            )}
            <button
              onClick={() => setMatchPopup(null)}
              className="w-full px-6 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            >
              {t('keepSwiping')}
            </button>
          </div>
        </div>
      )}

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px-64px)] md:min-h-[calc(100vh-57px)] p-4 pb-24 md:pb-8">
        {/* [EN] Conditional rendering based on verification status / [KR] 인증 상태에 따른 조건부 렌더링 */}
        {verificationStatus === 'PENDING' ? (
          <UnverifiedState />
        ) : verificationStatus === 'VERIFYING' ? (
          <VerifyingState />
        ) : !currentProfile ? (
          /* [EN] No more profiles / [KR] 더 이상 프로필이 없음 */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-pink-500">explore</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noMoreProfiles')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{t('noMoreProfilesDesc')}</p>
            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-pink-200 dark:shadow-pink-900/30 hover:opacity-90 transition-opacity"
            >
              {t('resetAndFindMore')}
            </button>
          </div>
        ) : (
          /* [EN] Card Stack UI / [KR] 카드 스택 UI */
          <div className="w-full max-w-md lg:max-w-2xl">
            {/* [EN] Keyboard hint for PC / [KR] PC용 키보드 힌트 */}
            <div className="hidden md:flex items-center justify-center gap-4 mb-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs">←</kbd>
                {t('pass')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs">→</kbd>
                {t('like')}
              </span>
            </div>

            {/* [EN] Main Card / [KR] 메인 카드 */}
            <div className="relative bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* [EN] Card Image - 80% of viewport height on mobile / [KR] 카드 이미지 - 모바일에서 뷰포트 높이의 80% */}
              <div className="relative h-[60vh] md:h-[500px] lg:h-[600px] bg-gray-200 dark:bg-zinc-700">
                {currentProfile.photos?.[0]?.url ? (
                  <img 
                    src={currentProfile.photos[0].url} 
                    alt={currentProfile.nickname || currentProfile.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-6xl">person</span>
                  </div>
                )}
                
                {/* [EN] Gradient overlay with info / [KR] 정보가 있는 그라데이션 오버레이 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">
                        {currentProfile.nickname || currentProfile.name}
                        {currentProfile.age && <span className="font-normal text-2xl ms-2">{currentProfile.age}</span>}
                      </h2>
                      {currentProfile.school && (
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">school</span>
                          {currentProfile.school}
                        </p>
                      )}
                      {currentProfile.introduction && (
                        <p className="text-white/70 text-sm mt-2 line-clamp-2">{currentProfile.introduction}</p>
                      )}
                    </div>
                    <Link 
                      href={`/users/${currentProfile.id}`}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <span className="material-symbols-outlined">info</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* [EN] Action Buttons / [KR] 액션 버튼 */}
              <div className="flex justify-center gap-6 p-6 bg-white dark:bg-zinc-800">
                <button 
                  onClick={() => handleAction('pass')}
                  className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 hover:scale-110 transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => handleAction('like')}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-pink-200 dark:shadow-pink-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}

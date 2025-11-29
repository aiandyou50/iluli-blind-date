'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';

// [EN] Match types for matching history / [KR] 매칭 내역을 위한 매치 타입
interface MatchedUser {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  instagramId?: string;
  matchedAt?: string;
}

interface SentLike {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  sentAt?: string;
}

export default function ConnectPage() {
  const t = useTranslations('connect');
  const tCommon = useTranslations('common');
  const { data: session, status: sessionStatus } = useSession();
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [sentLikes, setSentLikes] = useState<SentLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  // [EN] Fetch matches and sent likes from API / [KR] API에서 매칭과 보낸 좋아요 조회
  const fetchMatchHistory = useCallback(() => {
    if (!session?.user?.id) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/matches/matched?userId=${session.user.id}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : []),
      fetch(`/api/matches/sent?userId=${session.user.id}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
    ])
      .then(([matched, sent]) => {
        setMatchedUsers(Array.isArray(matched) ? matched : []);
        setSentLikes(Array.isArray(sent) ? sent : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch match history:', err);
        setLoading(false);
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMatchHistory();
    } else if (sessionStatus !== 'loading') {
      setLoading(false);
    }
  }, [session?.user?.id, sessionStatus, fetchMatchHistory]);

  // [EN] Handle Instagram connection: Copy ID to clipboard and open Instagram / [KR] 인스타그램 연결 처리: 아이디 복사 후 인스타그램 열기
  const handleConnectInstagram = (username: string) => {
    // [EN] Copy to clipboard / [KR] 클립보드에 복사
    navigator.clipboard.writeText(username).then(() => {
      showToast();
      
      // [EN] Open Instagram after delay / [KR] 딜레이 후 인스타그램 열기
      setTimeout(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `instagram://user?username=${username}`;
        } else {
          window.open(`https://www.instagram.com/${username}`, '_blank');
        }
      }, 1500);
    });
  };

  // [EN] Show toast notification / [KR] 토스트 알림 표시
  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  // [EN] Format relative time / [KR] 상대 시간 포맷
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('hoursAgo', { count: diffHours });
    return t('daysAgo', { count: diffDays });
  };

  // [EN] Get total matches count / [KR] 총 매칭 수 가져오기
  const totalMatches = matchedUsers.length;

  // [EN] Loading state / [KR] 로딩 상태
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // [EN] Empty state when no matches / [KR] 매치가 없을 때 빈 상태
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-pink-500">favorite</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {t('noMatches')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        {t('noMatchesDesc')}
      </p>
      <Link 
        href="/matching"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 dark:shadow-pink-900/30 hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined">favorite</span>
        {t('startMatching')}
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      
      {/* [EN] Toast Notification / [KR] 토스트 알림 */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex flex-col items-center gap-2 w-64 text-center transition-all duration-300 ${
          toastVisible 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mb-1">
          <span className="material-symbols-outlined text-lg">check</span>
        </div>
        <p className="font-bold">{t('idCopied')}</p>
        <p className="text-xs text-gray-300">{t('openingInstagram')}</p>
      </div>

      {/* [EN] Main Content - Responsive Layout / [KR] 메인 컨텐츠 - 반응형 레이아웃 */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="w-full max-w-2xl lg:max-w-4xl mx-auto px-4 py-4 space-y-6">
          
          {/* [EN] Header with total count / [KR] 총 수가 있는 헤더 */}
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl text-gray-800 dark:text-white">{t('matchHistory')}</h1>
            {totalMatches > 0 && (
              <div className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {t('totalConnected', { count: totalMatches })}
              </div>
            )}
          </div>

          {matchedUsers.length === 0 && sentLikes.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* [EN] Section 1: Matched (Mutual Likes) / [KR] 섹션 1: 매칭 성공 (서로 좋아요) */}
              {matchedUsers.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-pink-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    {t('matchedSection')}
                  </h2>
                  
                  <div className="space-y-3">
                    {matchedUsers.map((match) => (
                      <div key={match.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-pink-100 dark:border-pink-900/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            {match.avatar ? (
                              <img 
                                src={match.avatar} 
                                alt={match.nickname || match.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center border-2 border-white shadow-md">
                                <span className="material-symbols-outlined text-2xl text-pink-500">person</span>
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-800"></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{match.nickname || match.name}</h3>
                              {match.matchedAt && (
                                <span className="text-xs text-gray-400">· {formatRelativeTime(match.matchedAt)}</span>
                              )}
                            </div>
                            <p className="text-xs text-pink-500 font-medium">{t('mutualLikeConfirmed')}</p>
                          </div>
                        </div>

                        {/* [EN] Instagram Action Box / [KR] 인스타그램 액션 박스 */}
                        {match.instagramId && (
                          <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-xl p-3 flex items-center justify-between border border-gray-100 dark:border-zinc-600">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                                </svg>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-gray-400">{t('instagramId')}</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white truncate">{match.instagramId}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleConnectInstagram(match.instagramId!)}
                              className="px-4 py-2 bg-white dark:bg-zinc-600 border border-gray-200 dark:border-zinc-500 shadow-sm rounded-lg text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-500 hover:text-pink-500 transition flex items-center gap-1 shrink-0"
                            >
                              {t('sendDM')} 
                              <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* [EN] Section 2: Sent Likes (Waiting) / [KR] 섹션 2: 보낸 호감 (대기 중) */}
              {sentLikes.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider mt-4">
                    {t('sentLikesSection')}
                  </h2>
                  <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden divide-y divide-gray-50 dark:divide-zinc-700">
                    {sentLikes.map((like) => (
                      <div key={like.id} className="p-3 flex items-center gap-3">
                        {like.avatar ? (
                          <img 
                            src={like.avatar} 
                            alt={like.nickname || like.name}
                            className="w-10 h-10 rounded-full object-cover grayscale opacity-60"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center grayscale opacity-60">
                            <span className="material-symbols-outlined text-gray-400">person</span>
                          </div>
                        )}
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400">{like.nickname || like.name}</h4>
                          <p className="text-[10px] text-gray-400">{t('waitingForResponse')}</p>
                        </div>
                        {like.sentAt && (
                          <span className="text-xs text-gray-300">{formatRelativeTime(like.sentAt)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

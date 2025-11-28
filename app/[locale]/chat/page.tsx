'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

// [EN] Placeholder match data for UI demonstration / [KR] UI 데모를 위한 플레이스홀더 매치 데이터
interface Match {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isNew?: boolean;
  instagramId?: string;
}

export default function ChatPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // [EN] Placeholder matches - in production, fetch from API / [KR] 플레이스홀더 매치 - 프로덕션에서는 API에서 가져옴
  const matches: Match[] = [];
  const newMatches: Match[] = [];

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  // [EN] Empty state when no matches / [KR] 매치가 없을 때 빈 상태
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-pink-500">favorite</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {t('chat.noMatches')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        {t('chat.noMatchesDesc')}
      </p>
      <Link 
        href="/matching"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 dark:shadow-pink-900/30 hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined">favorite</span>
        {t('chat.startMatching')}
      </Link>
    </div>
  );

  // [EN] Chat list sidebar / [KR] 채팅 목록 사이드바
  const ChatList = () => (
    <div className="flex flex-col h-full">
      {/* [EN] New Matches Section / [KR] 새로운 매칭 섹션 */}
      {newMatches.length > 0 && (
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-pink-500 mb-3">{t('chat.newMatches')}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {newMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleMatchClick(match)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                      <span className="text-xl font-bold text-gray-400">{match.name[0]}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xs">favorite</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{match.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* [EN] Message List / [KR] 메시지 목록 */}
      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleMatchClick(match)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
                  selectedMatch?.id === match.id ? 'bg-pink-50 dark:bg-pink-900/10' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span className="text-xl font-bold text-gray-400">{match.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{match.name}</h4>
                    <span className="text-xs text-gray-400">{match.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{match.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // [EN] Chat room content / [KR] 채팅방 내용
  const ChatRoom = ({ match }: { match: Match }) => (
    <div className="flex flex-col h-full">
      {/* [EN] Chat Header / [KR] 채팅 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-zinc-800">
        <button 
          onClick={() => setSelectedMatch(null)}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
          <span className="text-lg font-bold text-gray-400">{match.name[0]}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{match.name}</h4>
          {match.instagramId && (
            <p className="text-xs text-purple-600">@{match.instagramId}</p>
          )}
        </div>
        {match.instagramId && (
          <a
            href={`https://instagram.com/${match.instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {t('chat.sendDM')}
          </a>
        )}
      </div>

      {/* [EN] Chat Messages Area / [KR] 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-white">celebration</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t('chat.matchedWith', { name: match.name })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('chat.startConversation')}
          </p>
          {match.instagramId && (
            <a
              href={`https://instagram.com/${match.instagramId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {t('chat.sendInstagramDM')}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900">
      <Header />
      
      <main className="flex-1 flex pb-16 md:pb-0">
        {/* [EN] Desktop Split View Layout / [KR] 데스크톱 분할 뷰 레이아웃 */}
        <div className="hidden md:flex w-full">
          {/* [EN] Left: Chat List / [KR] 왼쪽: 채팅 목록 */}
          <div className="w-80 lg:w-96 border-r border-gray-100 dark:border-zinc-800 h-[calc(100vh-57px)]">
            <ChatList />
          </div>
          
          {/* [EN] Right: Chat Room / [KR] 오른쪽: 채팅방 */}
          <div className="flex-1 h-[calc(100vh-57px)]">
            {selectedMatch ? (
              <ChatRoom match={selectedMatch} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl mb-4">chat</span>
                  <p className="text-lg">{t('chat.selectConversation')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* [EN] Mobile Single View Layout / [KR] 모바일 단일 뷰 레이아웃 */}
        <div className="md:hidden w-full h-[calc(100vh-57px-64px)]">
          {selectedMatch ? (
            <ChatRoom match={selectedMatch} />
          ) : (
            <ChatList />
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

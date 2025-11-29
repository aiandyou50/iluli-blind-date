'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  // [EN] Check if the current path matches the link / [KR] 현재 경로가 링크와 일치하는지 확인
  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav className="fixed bottom-0 z-50 w-full md:hidden bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 safe-area-inset-bottom">
      <div className="flex h-16 justify-around items-center">
        {/* [EN] Feed Tab / [KR] 피드 탭 */}
        <Link
          href="/feed"
          className={`flex flex-1 flex-col items-center justify-center gap-1 relative ${
            isActive('/feed') 
              ? 'text-pink-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isActive('/feed') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-pink-500 rounded-full" />
          )}
          <span 
            className="material-symbols-outlined text-2xl" 
            style={{ fontVariationSettings: isActive('/feed') ? "'FILL' 1" : "'FILL' 0" }}
          >
            explore
          </span>
          <p className="text-xs font-bold">{t('feed')}</p>
        </Link>

        {/* [EN] Matching Tab (Home) / [KR] 매칭 탭 (홈) */}
        <Link
          href="/matching"
          className={`flex flex-1 flex-col items-center justify-center gap-1 relative ${
            isActive('/matching') 
              ? 'text-pink-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isActive('/matching') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-pink-500 rounded-full" />
          )}
          <span 
            className="material-symbols-outlined text-2xl" 
            style={{ fontVariationSettings: isActive('/matching') ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          <p className="text-xs font-bold">{t('swipe')}</p>
        </Link>

        {/* [EN] Connect Tab (Match History) / [KR] 연결 탭 (매칭 내역) */}
        <Link
          href="/connect"
          className={`flex flex-1 flex-col items-center justify-center gap-1 relative ${
            isActive('/connect') 
              ? 'text-pink-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isActive('/connect') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-pink-500 rounded-full" />
          )}
          <span 
            className="material-symbols-outlined text-2xl" 
            style={{ fontVariationSettings: isActive('/connect') ? "'FILL' 1" : "'FILL' 0" }}
          >
            heart_handshake
          </span>
          <p className="text-xs font-bold">{t('connect')}</p>
        </Link>

        {/* [EN] Profile Tab / [KR] 프로필 탭 */}
        <Link
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-center gap-1 relative ${
            isActive('/profile') 
              ? 'text-pink-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isActive('/profile') && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-pink-500 rounded-full" />
          )}
          <span 
            className="material-symbols-outlined text-2xl" 
            style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <p className="text-xs font-bold">{t('profile')}</p>
        </Link>
      </div>
    </nav>
  );
}

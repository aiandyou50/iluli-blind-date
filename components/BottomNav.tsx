'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-[480px] border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm">
      <div className="flex h-16 justify-around">
        <Link 
          href="/feed" 
          className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${isActive('/feed') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/feed') ? "'FILL' 1" : "'FILL' 0" }}>
            home
          </span>
          <p className="text-xs font-bold">{t('feed')}</p>
        </Link>
        
        <Link 
          href="/matching" 
          className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${isActive('/matching') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/matching') ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          <p className="text-xs font-bold">{t('swipe')}</p>
        </Link>

        <Link 
          href="/profile" 
          className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${isActive('/profile') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "'FILL' 0" }}>
            person
          </span>
          <p className="text-xs font-bold">{t('profile')}</p>
        </Link>
      </div>
    </nav>
  );
}

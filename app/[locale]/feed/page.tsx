'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';

// [EN] Photo type definition / [KR] 사진 타입 정의
interface PhotoType {
  id: string;
  url: string;
  userId: string;
  isLiked?: boolean;
  _count?: { likes: number };
  user?: { name?: string; nickname?: string };
}

export default function FeedPage() {
  const t = useTranslations('feed');
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    setLoading(true);
    const viewerId = session?.user?.id;
    const url = viewerId 
      ? `/api/photos?sort=${sortBy}&viewerId=${viewerId}`
      : `/api/photos?sort=${sortBy}`;

    fetch(url)
      .then(res => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setPhotos(data as PhotoType[]);
        } else {
          console.error("API returned non-array:", data);
          setPhotos([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [sortBy, session]);

  const handleLike = async (photoId: string) => {
    if (!session?.user?.id) return;
    
    // [EN] Optimistic update / [KR] 낙관적 업데이트
    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        const isLiked = p.isLiked;
        return {
          ...p,
          _count: { likes: (p._count?.likes || 0) + (isLiked ? -1 : 1) },
          isLiked: !isLiked
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId: session.user.id })
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      
      <main className="w-full px-3 md:px-6 lg:px-8 py-4 pb-24 md:pb-8">
        {/* [EN] Filter Bar / [KR] 필터 바 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                sortBy === 'latest'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              {t('filterLatest')}
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                sortBy === 'popular'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              {t('filterPopular')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-pink-500">photo_library</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t('noPhotos')}</p>
          </div>
        ) : (
          /* [EN] Masonry Grid - 2 columns mobile, 3 tablet, 4+ desktop / [KR] 매소너리 그리드 - 모바일 2열, 태블릿 3열, 데스크톱 4열 이상 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {photos.map((item) => (
              <div 
                key={item.id} 
                className="group relative rounded-2xl bg-white dark:bg-zinc-800 shadow-sm overflow-hidden border border-gray-100 dark:border-zinc-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* [EN] Thumbnail with overlay info / [KR] 오버레이 정보가 있는 썸네일 */}
                <Link href={`/users/${item.userId}`} className="block relative aspect-[3/4]">
                  <img 
                    className="w-full h-full object-cover" 
                    src={item.url} 
                    alt={item.user?.nickname || item.user?.name || 'Photo'} 
                  />
                  {/* [EN] Gradient overlay with name / [KR] 이름이 있는 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm truncate">
                        {item.user?.nickname || item.user?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </Link>
                
                {/* [EN] Like button footer / [KR] 좋아요 버튼 푸터 */}
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-800">
                  <button 
                    onClick={() => handleLike(item.id)} 
                    className="flex items-center gap-1.5 group/like"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={item.isLiked ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className={`w-5 h-5 transition-all ${
                        item.isLiked 
                          ? "text-pink-500 scale-110" 
                          : "text-gray-400 group-hover/like:text-pink-500 group-hover/like:scale-110"
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item._count?.likes || 0}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}

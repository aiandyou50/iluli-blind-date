'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import Link from 'next/link';

export default function FeedPage() {
  const t = useTranslations('feed');
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<any[]>([]);
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
      .then((data: any) => {
        if (Array.isArray(data)) {
          setPhotos(data);
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
    
    // Optimistic update
    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        const isLiked = p.isLiked;
        return {
          ...p,
          _count: { likes: p._count.likes + (isLiked ? -1 : 1) },
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
      // Revert on error (omitted for brevity)
    }
  };

  return (
    <>
      <Header />
      
      <main className="flex flex-col gap-4 p-2 md:p-4 pb-32">
        <div className="flex justify-end px-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded p-1 bg-white dark:bg-zinc-800 dark:text-white"
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : photos.length === 0 ? (
          <div className="text-center p-8 text-gray-500">{t('noPhotos')}</div>
        ) : (
          photos.map((item) => (
            <div key={item.id} className="flex flex-col rounded-lg bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
              <Link href={`/profile/${item.userId}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                   {/* Placeholder avatar if no user image */}
                   <span className="text-lg font-bold text-gray-500">
                     {item.user?.name?.[0] || '?'}
                   </span>
                </div>
                <p className="text-sm font-bold text-[#181011] dark:text-background-light">
                  {item.user?.nickname || item.user?.name || 'Unknown User'}
                </p>
              </Link>
              <div className="relative w-full">
                <img 
                  className="w-full h-auto object-cover" 
                  src={item.url} 
                  alt="Feed photo" 
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleLike(item.id)} className="group flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill={item.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${item.isLiked ? "text-red-500" : "text-zinc-600 group-hover:text-red-500"} dark:text-zinc-400`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item._count?.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
      
      <BottomNav />
    </>
  );
}

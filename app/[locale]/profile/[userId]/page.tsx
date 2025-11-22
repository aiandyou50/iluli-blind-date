'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSession } from 'next-auth/react';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: session } = useSession();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const viewerId = session?.user?.id;
      const photosUrl = viewerId 
        ? `/api/photos?userId=${userId}&viewerId=${viewerId}`
        : `/api/photos?userId=${userId}`;

      Promise.all([
        fetch(photosUrl).then(res => res.json()),
        fetch(`/api/users/${userId}`).then(res => res.json())
      ])
      .then(([photosData, userData]) => {
        setPhotos(photosData as any[]);
        setUser(userData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [userId, session]);

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
    }
  };

  if (loading) return <div className="p-8 text-center">{tCommon('loading')}</div>;
  if (!user) return <div className="p-8 text-center">{tCommon('error')}</div>;

  return (
    <>
      <Header title={user.nickname || user.name} />
      <main className="flex flex-col md:flex-row gap-4 p-4 pb-32">
        <div className="w-full md:w-1/3 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm h-fit sticky top-20">
          <div className="flex flex-col items-center mb-6">
             <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                <span className="text-3xl font-bold text-gray-500">
                  {user.name?.[0] || '?'}
                </span>
             </div>
            <h2 className="text-xl font-bold">{user.nickname || user.name}</h2>
            <p className="text-gray-500">{user.introduction || t('introductionLabel')}</p>
            {user.gender && (
              <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {user.gender === 'MALE' ? t('male') : t('female')}
              </span>
            )}
          </div>

          {user.instagramId && (
            <a 
              href={`https://instagram.com/${user.instagramId.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              {t('visitInstagram')}
            </a>
          )}
        </div>

        <div className="w-full md:w-2/3 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{t('myPhotos')}</h3>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo: any) => (
                <div key={photo.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img src={photo.url} alt="User photo" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <button 
                      onClick={() => handleLike(photo.id)}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        photo.isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={photo.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      {photo._count?.likes || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noPhotos')}</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState } from 'react';
import { use } from 'react';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetch(`/api/photos?userId=${userId}`)
        .then(res => res.json())
        .then((data) => {
          setPhotos(data as any[]);
          // We also need user info. The photos API returns photos, but we might need a separate call or extract from photos if included.
          // Let's fetch user profile separately or assume the first photo has user info if we modified the API.
          // Actually, let's fetch the user profile by ID. We need a new endpoint or modify existing one.
          // Existing /api/profile takes email. Let's modify it to take userId too or create a new one.
          // For now, let's try to get user info from the feed page data passed via state? No, that's complex.
          // Let's fetch user info by ID.
          fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(userData => setUser(userData))
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) return <div className="p-8 text-center">{tCommon('loading')}</div>;
  if (!user) return <div className="p-8 text-center">{tCommon('error')}</div>;

  return (
    <>
      <Header title={user.name} />
      <main className="flex flex-col gap-4 p-4 pb-24">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center mb-6">
             <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                <span className="text-3xl font-bold text-gray-500">
                  {user.name?.[0] || '?'}
                </span>
             </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
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

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{t('photos')}</h3>
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {photos.map((photo: any) => (
                <div key={photo.id} className="rounded-lg overflow-hidden">
                  <img src={photo.url} alt="User photo" className="w-full h-auto object-cover" />
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

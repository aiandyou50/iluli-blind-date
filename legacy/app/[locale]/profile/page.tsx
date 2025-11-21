'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import PhotoUpload from '@/components/PhotoUpload';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const [instagramId, setInstagramId] = useState('');
  const [bio, setBio] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);

  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // [EN] Fetch user profile from API, supporting both 'bio' and 'introduction' field names
  // [KR] API에서 사용자 프로필 조회, 'bio'와 'introduction' 필드명 모두 지원
  const fetchProfile = () => {
    if (session?.user?.email) {
      fetch(`/api/profile?email=${session.user.email}`)
        .then(res => res.json())
        .then((data: any) => {
          if (data.id) setUserId(data.id);
          if (data.instagramId) setInstagramId(data.instagramId);
          // [EN] Support both 'bio' and 'introduction' field names for API compatibility
          // [KR] API 호환성을 위해 'bio'와 'introduction' 필드명 모두 지원
          if (data.bio || data.introduction) setBio(data.bio || data.introduction);
          if (data.nickname) setNickname(data.nickname);
          if (data.photos) setPhotos(data.photos);
        })
        .catch(err => console.error("Failed to load profile", err));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.email) return;
    
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          instagramId,
          bio,
          nickname
        })
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        fetchProfile();
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm(t('deletePhoto') + '?')) return;

    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedPhoto(null);
        fetchProfile();
      } else {
        alert(tCommon('error'));
      }
    } catch (error) {
      console.error(error);
      alert(tCommon('error'));
    }
  };

  return (
    <>
      <Header title={tCommon('appName')} />
      <main className="flex flex-col gap-4 p-4 pb-24 relative">
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <img src={selectedPhoto.url} alt="Selected" className="w-full h-auto max-h-[60vh] object-contain bg-black" />
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                  <span className="font-bold">{selectedPhoto._count?.likes || 0} Likes</span>
                </div>
                <button 
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="text-red-500 hover:text-red-700 font-medium px-3 py-1 border border-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t('deletePhoto')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            )}
            <h2 className="text-xl font-bold">{session?.user?.name || 'User'}</h2>
            <p className="text-gray-500">{session?.user?.email}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-zinc-700 dark:text-white dark:ring-zinc-600"
                placeholder="Your nickname"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('instagramLabel')}
              </label>
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">@</span>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => setInstagramId(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-white"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bioLabel')}
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-zinc-700 dark:text-white dark:ring-zinc-600"
                placeholder="Hello, I like coffee!"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isSaving ? t('savingButton') : t('saveButton')}
            </button>
            {message && <p className="text-center text-sm text-green-600 mt-2">{message}</p>}
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{t('myPhotos')}</h3>
          
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {photos.map((photo: any) => (
                <div 
                  key={photo.id} 
                  className="aspect-square relative overflow-hidden rounded-md group cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.url} alt="User photo" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noPhotos')}</p>
          )}

          {userId && (
            <>
              {(!nickname || !bio || !instagramId) ? (
                <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                  Please complete your profile (Nickname, Bio, Instagram) to upload photos.
                </div>
              ) : (
                <PhotoUpload userId={userId} onUploadSuccess={fetchProfile} />
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

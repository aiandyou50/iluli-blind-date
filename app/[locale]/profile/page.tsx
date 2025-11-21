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
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);

  const fetchProfile = () => {
    if (session?.user?.email) {
      fetch(`/api/profile?email=${session.user.email}`)
        .then(res => res.json())
        .then((data: any) => {
          if (data.id) setUserId(data.id);
          if (data.instagramId) setInstagramId(data.instagramId);
          if (data.bio) setBio(data.bio);
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
          bio
        })
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
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
      <main className="flex flex-col gap-4 p-4 pb-24">
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
                <div key={photo.id} className="aspect-square relative overflow-hidden rounded-md group">
                  <img src={photo.url} alt="User photo" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noPhotos')}</p>
          )}

          {userId && (
            <PhotoUpload userId={userId} onUploadSuccess={fetchProfile} />
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

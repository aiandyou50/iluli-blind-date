'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import PhotoUpload from '@/components/PhotoUpload';

// [EN] Photo type definition / [KR] 사진 타입 정의
interface PhotoType {
  id: string;
  url: string;
  _count?: { likes: number };
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const [instagramId, setInstagramId] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [school, setSchool] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);

  // [EN] Fetch user profile from API / [KR] API에서 사용자 프로필 조회
  const fetchProfile = useCallback(() => {
    if (session?.user?.email) {
      fetch(`/api/profile?email=${session.user.email}`, { cache: 'no-store' })
        .then(res => res.json())
        .then((data: unknown) => {
          const profile = data as { id?: string; instagramId?: string; introduction?: string; bio?: string; nickname?: string; gender?: string; school?: string; photos?: PhotoType[] };
          if (profile.id) setUserId(profile.id);
          if (profile.instagramId) setInstagramId(profile.instagramId);
          if (profile.introduction || profile.bio) setIntroduction(profile.introduction || profile.bio || '');
          if (profile.nickname) setNickname(profile.nickname);
          if (profile.gender) setGender(profile.gender);
          if (profile.school) setSchool(profile.school);
          if (profile.photos) setPhotos(profile.photos);
        })
        .catch(err => console.error("Failed to load profile", err));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
          introduction,
          nickname,
          gender,
          school
        })
      });

      if (res.ok) {
        setMessage(t('saveSuccess'));
        fetchProfile();
      } else {
        setMessage(t('saveError'));
      }
    } catch (error) {
      console.error(error);
      setMessage(tCommon('error'));
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

  // [EN] Check if profile is complete / [KR] 프로필이 완성되었는지 확인
  const isProfileComplete = nickname && introduction && instagramId && gender;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      
      {/* [EN] Photo Modal / [KR] 사진 모달 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={selectedPhoto.url} 
                alt="Selected" 
                className="w-full h-auto max-h-[60vh] object-contain bg-black" 
              />
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 end-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-500">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="font-bold">{selectedPhoto._count?.likes || 0}</span>
              </div>
              <button 
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-xl border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {t('deletePhoto')}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* [EN] Page Title / [KR] 페이지 제목 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editProfile')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('editProfileDesc')}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* [EN] Left Column: Profile Info / [KR] 왼쪽 컬럼: 프로필 정보 */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-700 lg:sticky lg:top-20">
                {/* [EN] Profile Header / [KR] 프로필 헤더 */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-100 dark:ring-pink-900/30" 
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-pink-500">person</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{session?.user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                </div>
                
                {/* [EN] Form Fields - 2 column grid on larger screens / [KR] 폼 필드 - 큰 화면에서 2열 그리드 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('nickname')} <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-700 ring-1 ring-inset ring-gray-200 dark:ring-zinc-600 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 transition-all"
                      placeholder={t('nicknamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('instagramLabel')} <span className="text-pink-500">*</span>
                    </label>
                    <div className="flex rounded-xl bg-gray-50 dark:bg-zinc-700 ring-1 ring-inset ring-gray-200 dark:ring-zinc-600 focus-within:ring-2 focus-within:ring-pink-500 transition-all">
                      <span className="flex select-none items-center ps-4 text-gray-400">@</span>
                      <input
                        type="text"
                        value={instagramId}
                        onChange={(e) => setInstagramId(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-3 ps-1 pe-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('school')}
                    </label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-700 ring-1 ring-inset ring-gray-200 dark:ring-zinc-600 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 transition-all"
                      placeholder={t('schoolPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('genderLabel')} <span className="text-pink-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-700 ring-1 ring-inset ring-gray-200 dark:ring-zinc-600 focus:ring-2 focus:ring-pink-500 transition-all"
                    >
                      <option value="">{t('selectGender')}</option>
                      <option value="MALE">{t('male')}</option>
                      <option value="FEMALE">{t('female')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('introductionLabel')} <span className="text-pink-500">*</span>
                    </label>
                    <textarea
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      rows={3}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-700 ring-1 ring-inset ring-gray-200 dark:ring-zinc-600 placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                      placeholder={t('introductionPlaceholder')}
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-end">{introduction.length}/300</p>
                  </div>

                  {message && (
                    <p className={`text-center text-sm py-2 rounded-xl ${message.includes('success') || message.includes('성공') ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* [EN] Right Column: Photos / [KR] 오른쪽 컬럼: 사진 */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('myPhotos')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('photoDesc')}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{photos.length}/9</span>
                </div>
                
                {/* [EN] 3x3 Photo Grid on mobile, 4x2 on desktop / [KR] 모바일에서 3x3, 데스크톱에서 4x2 사진 그리드 */}
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="aspect-square relative overflow-hidden rounded-xl group cursor-pointer ring-1 ring-gray-200 dark:ring-zinc-700 hover:ring-pink-500 transition-all"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img 
                        src={photo.url} 
                        alt="User photo" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          zoom_in
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* [EN] Empty slots / [KR] 빈 슬롯 */}
                  {Array.from({ length: Math.max(0, 9 - photos.length) }).map((_, i) => (
                    <div 
                      key={`empty-${i}`} 
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-zinc-600">add_photo_alternate</span>
                    </div>
                  ))}
                </div>

                {/* [EN] Photo Upload Section / [KR] 사진 업로드 섹션 */}
                {userId && (
                  <>
                    {!isProfileComplete ? (
                      <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl">
                        <span className="material-symbols-outlined text-2xl mb-2">info</span>
                        <p className="text-sm font-medium">{t('completeProfileFirst')}</p>
                      </div>
                    ) : (
                      <PhotoUpload userId={userId} onUploadSuccess={fetchProfile} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* [EN] Floating Save Button / [KR] 플로팅 저장 버튼 */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 md:px-6 lg:px-8 z-40">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !isProfileComplete}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-xl shadow-pink-200 dark:shadow-pink-900/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('savingButton')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                {t('saveButton')}
              </>
            )}
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

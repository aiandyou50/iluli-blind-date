'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';

// [EN] User and Photo type definitions / [KR] 사용자 및 사진 타입 정의
interface User {
  id: string;
  name?: string;
  nickname?: string;
  introduction?: string;
  gender?: string;
  school?: string;
  age?: number;
  instagramId?: string;
}

interface Photo {
  id: string;
  url: string;
  isLiked?: boolean;
  _count?: { likes: number };
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const { data: session } = useSession();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
        setPhotos(photosData as Photo[]);
        setUser(userData as User);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [userId, session]);

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

  const handleSwipePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    } else if (direction === 'next' && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">person_off</span>
          <p className="text-gray-500">{tCommon('error')}</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      
      <main className="w-full pb-24 md:pb-8">
        {/* [EN] Two-column layout for PC / [KR] PC용 2열 레이아웃 */}
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-57px)]">
          
          {/* [EN] Hero Image Section - 60% on mobile, left side on PC / [KR] 히어로 이미지 섹션 - 모바일 60%, PC 왼쪽 */}
          <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-auto lg:min-h-[600px] bg-gray-200 dark:bg-zinc-800">
            {currentPhoto ? (
              <>
                <img 
                  src={currentPhoto.url} 
                  alt={user.nickname || user.name || 'Profile'} 
                  className="w-full h-full object-cover"
                />
                
                {/* [EN] Photo navigation / [KR] 사진 네비게이션 */}
                {photos.length > 1 && (
                  <>
                    {/* [EN] Dots indicator / [KR] 점 표시기 */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`h-1 rounded-full transition-all ${
                            idx === currentPhotoIndex 
                              ? 'w-6 bg-white' 
                              : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* [EN] Swipe areas / [KR] 스와이프 영역 */}
                    <button 
                      onClick={() => handleSwipePhoto('prev')}
                      className="absolute left-0 top-0 bottom-0 w-1/3 opacity-0"
                      disabled={currentPhotoIndex === 0}
                    />
                    <button 
                      onClick={() => handleSwipePhoto('next')}
                      className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0"
                      disabled={currentPhotoIndex === photos.length - 1}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-gray-400">person</span>
              </div>
            )}
          </div>
          
          {/* [EN] Info Sheet - Slides up on mobile, right panel on PC / [KR] 정보 시트 - 모바일에서 슬라이드업, PC에서 오른쪽 패널 */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-zinc-900 rounded-t-3xl lg:rounded-none -mt-6 lg:mt-0 relative z-10 lg:overflow-y-auto">
            <div className="p-6 lg:p-8 lg:max-w-xl lg:mx-auto">
              {/* [EN] Handle bar on mobile / [KR] 모바일 핸들바 */}
              <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 lg:hidden" />
              
              {/* [EN] User Info / [KR] 사용자 정보 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {user.nickname || user.name}
                    {user.age && <span className="font-normal text-gray-500 dark:text-gray-400 ms-2">{user.age}</span>}
                  </h1>
                  {user.gender && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.gender === 'MALE' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                    }`}>
                      {user.gender === 'MALE' ? t('male') : t('female')}
                    </span>
                  )}
                </div>
                
                {user.school && (
                  <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-3">
                    <span className="material-symbols-outlined text-lg">school</span>
                    {user.school}
                  </p>
                )}
                
                {user.introduction && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {user.introduction}
                  </p>
                )}
              </div>
              
              {/* [EN] Instagram Connect Section / [KR] 인스타그램 연결 섹션 */}
              {user.instagramId && (
                <div className="mb-6">
                  <a
                    href={`https://instagram.com/${user.instagramId.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t('visitInstagram')}</p>
                      <p className="text-white/80 text-sm">@{user.instagramId.replace('@', '')}</p>
                    </div>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
              )}
              
              {/* [EN] Photo Gallery / [KR] 사진 갤러리 */}
              {photos.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('photos')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`aspect-square rounded-xl overflow-hidden ring-2 transition-all ${
                          idx === currentPhotoIndex 
                            ? 'ring-pink-500 ring-offset-2 dark:ring-offset-zinc-900' 
                            : 'ring-transparent hover:ring-gray-300 dark:hover:ring-zinc-600'
                        }`}
                      >
                        <img 
                          src={photo.url} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* [EN] Sticky Footer with Like Button / [KR] 좋아요 버튼이 있는 스티키 푸터 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {currentPhoto && (
            <>
              <button
                onClick={() => handleLike(currentPhoto.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                  currentPhoto.isLiked
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontVariationSettings: currentPhoto.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                {currentPhoto.isLiked ? t('liked') : t('sendLike')}
              </button>
              
              {user.instagramId && (
                <a
                  href={`https://instagram.com/${user.instagramId.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </a>
              )}
            </>
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

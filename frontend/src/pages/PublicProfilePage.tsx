import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '../api/users';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600 text-lg">{t('profile.loadError')}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-600 transition-colors"
          >
            {t('auth.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const { profile, photos } = data;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="layout-content-container mx-auto flex max-w-2xl flex-col flex-1 px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col gap-4 items-start">
          {/* Profile Picture */}
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 bg-gray-200" 
               style={profile.profile_image_url ? { backgroundImage: `url(${profile.profile_image_url})` } : {}}
          />
          
          <div className="flex flex-col gap-2">
            {/* Name */}
            <h1 className="text-[#181011] dark:text-white text-2xl font-bold tracking-tight">
              {profile.nickname}
            </h1>
            
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {profile.mbti && (
                <div className="flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-primary text-xs font-bold">
                  {profile.mbti}
                </div>
              )}
              {profile.school && (
                <div className="flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-primary text-xs font-bold">
                  {profile.school}
                </div>
              )}
              {profile.age && (
                <div className="flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-primary text-xs font-bold">
                  {profile.age}{t('profile.age')}
                </div>
              )}
              {profile.student_verified && (
                <div className="flex items-center justify-center rounded-full bg-success-100 px-3 py-1 text-success-700 text-xs font-bold">
                  ✓ {t('profile.studentVerified')}
                </div>
              )}
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="text-[#8d5e63] dark:text-gray-300 text-base font-normal leading-relaxed pt-2">
                {profile.bio}
              </p>
            )}
          </div>
          
          {/* Instagram Button */}
          {profile.instagram_url && (
            <button 
              onClick={() => window.open(profile.instagram_url, '_blank')}
              className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary-600 transition-colors"
            >
              <svg className="feather feather-instagram" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                <rect height="20" rx="5" ry="5" width="20" x="2" y="2"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              <span>{t('profile.instagramDM')}</span>
            </button>
          )}
        </div>
        
        {/* Section Header for Photos */}
        <h2 className="text-[#181011] dark:text-white text-lg font-bold tracking-tight pb-2 pt-8">
          {t('profile.verifiedPhotos')}
        </h2>
        
        {/* Image Grid */}
        {photos.length === 0 ? (
          <div className="flex flex-col pt-8">
            <div className="flex flex-col items-center gap-4 text-center p-6 bg-white dark:bg-background-dark/50 rounded">
              <span className="material-symbols-outlined text-4xl text-primary">photo_camera</span>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[#181011] dark:text-white text-lg font-bold">{t('profile.noPhotos')}</p>
                <p className="text-[#8d5e63] dark:text-gray-300 text-sm font-normal max-w-xs">
                  {t('profile.noPhotos')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo: { id: string; image_url: string; likes_count: number }) => (
              <div key={photo.id} className="flex flex-col">
                <div 
                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded"
                  style={{ backgroundImage: `url(${photo.image_url})` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

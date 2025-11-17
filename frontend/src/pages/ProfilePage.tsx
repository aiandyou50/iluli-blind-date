import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateMyProfile, uploadPhoto, deletePhoto, requestPhotoVerification } from '@/api/profile';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import PhotoModal from '@/components/PhotoModal';
import Layout from '@/components/Layout';
import type { ProfilePhoto } from '@/types/profile';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    school: '',
    mbti: '',
    bio: '',
    instagram_url: '',
  });

  // 프로필 조회
  const { data, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
  });

  // 프로필 수정
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setIsEditing(false);
      alert('프로필이 업데이트되었습니다!');
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`);
    },
  });

  // 사진 업로드
  const uploadMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      alert('사진이 업로드되었습니다!');
    },
    onError: (error: Error) => {
      alert(`업로드 실패: ${error.message}`);
    },
  });

  // 사진 삭제
  const deleteMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      alert('사진이 삭제되었습니다!');
    },
  });

  // 인증 요청
  const verifyMutation = useMutation({
    mutationFn: requestPhotoVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      alert('인증 요청이 제출되었습니다!');
    },
  });

  const handleEditClick = () => {
    if (data?.profile) {
      setFormData({
        nickname: data.profile.nickname || '',
        school: data.profile.school || '',
        mbti: data.profile.mbti || '',
        bio: data.profile.bio || '',
        instagram_url: data.profile.instagram_url || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 이미지 압축 - 20% 진행
      setUploadProgress(20);
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (progress) => {
          // 압축 진행도: 20% ~ 60%
          setUploadProgress(20 + (progress * 0.4));
        },
      });

      // 업로드 시작 - 60% 진행
      setUploadProgress(60);
      
      // 업로드 완료 후
      await uploadMutation.mutateAsync(compressedFile);
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      alert('이미지 압축 실패');
      console.error(error);
    }

    // Reset file input
    e.target.value = '';
  };

  const handlePhotoClick = (photo: ProfilePhoto) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleDeletePhoto = (photoId: string) => {
    deleteMutation.mutate(photoId);
  };

  const handleVerifyFestival = (photoId: string) => {
    verifyMutation.mutate(photoId);
  };

  if (isLoading) {
    return (
      <Layout currentPage="profile">
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-600 dark:text-gray-400">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  const profile = data?.profile;
  const photos = data?.photos || [];

  return (
    <Layout currentPage="profile">
      {/* 메인 콘텐츠 */}
      <main className="px-4 py-6">
        {/* 프로필 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">기본 정보</h2>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                수정하기
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">이메일:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{profile?.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">닉네임:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{profile?.nickname || '미설정'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">학교:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{profile?.school || '미설정'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">MBTI:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{profile?.mbti || '미설정'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">자기소개:</span>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{profile?.bio || '미설정'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">인스타그램:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{profile?.instagram_url || '미설정'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="닉네임"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="학교"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="MBTI"
                value={formData.mbti}
                onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <textarea
                placeholder="자기소개"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <input
                type="text"
                placeholder="https://www.instagram.com/username"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 내 사진 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">내 사진</h2>

          {/* 업로드 버튼 */}
          <label className={`inline-block px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 mb-4 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? '업로드 중...' : '사진 업로드'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              aria-label="사진 업로드"
            />
          </label>

          {/* 업로드 진행률 바 */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">업로드 진행 중...</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* 사진 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.image_url}
                  alt="프로필 사진"
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handlePhotoClick(photo)}
                  onError={(e) => {
                    console.error('Image failed to load:', photo.image_url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E이미지 로드 실패%3C/text%3E%3C/svg%3E';
                  }}
                />
                {/* 좋아요 수 표시 */}
                {photo.likes_count > 0 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                    ❤️ {photo.likes_count}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                  <span className="text-white text-sm">
                    {photo.verification_status === 'approved' && '✅ 승인됨'}
                    {photo.verification_status === 'pending' && '⏳ 대기중'}
                    {photo.verification_status === 'rejected' && '❌ 거절됨'}
                    {photo.verification_status === 'not_applied' && '🔒 미신청'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoClick(photo);
                    }}
                    className="px-3 py-1 bg-white text-gray-900 text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    자세히 보기
                  </button>
                  {photo.verification_status === 'rejected' && photo.rejection_reason && (
                    <p className="text-white text-xs mt-2 px-2 text-center">
                      거절 사유: {photo.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">아직 업로드한 사진이 없습니다.</p>
          )}
        </div>
      </main>

      {/* Photo Modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDeletePhoto}
        onVerifyFestival={handleVerifyFestival}
      />
    </Layout>
  );
}

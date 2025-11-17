import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/users';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">프로필을 불러올 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { profile, photos } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 뒤로가기
          </button>
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 닉네임 및 기본 정보 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.nickname}
            </h1>
            
            {/* 태그 배지 */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {profile.school && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  🎓 {profile.school}
                </span>
              )}
              {profile.major && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  📚 {profile.major}
                </span>
              )}
              {profile.mbti && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  🧠 {profile.mbti}
                </span>
              )}
              {profile.age && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  🎂 {profile.age}세
                </span>
              )}
              {profile.student_verified && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  ✓ 학생 인증
                </span>
              )}
            </div>

            {/* 자기소개 */}
            {profile.bio && (
              <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto">
                {profile.bio}
              </p>
            )}

            {/* 인스타그램 버튼 (조건부 렌더링) */}
            {profile.instagram_url && (
              <div className="mt-4">
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </div>
            )}
          </div>

          {/* 사진 그리드 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">사진</h2>
            
            {photos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                아직 승인된 사진이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo: { id: string; image_url: string; likes_count: number }) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={photo.image_url}
                      alt="프로필 사진"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* 좋아요 수 표시 */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm flex items-center">
                      ❤️ {photo.likes_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

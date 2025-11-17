import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getFeed, likePhoto, unlikePhoto, FeedPhoto, FeedResponse } from '@/api/feed';
import { useNavigate } from 'react-router-dom';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

type SortOption = 'latest' | 'oldest' | 'popular' | 'random' | 'distance';

export default function FeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedPhoto, setSelectedPhoto] = useState<FeedPhoto | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // 무한 스크롤로 피드 데이터 가져오기
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed', sortBy, userLocation],
    queryFn: ({ pageParam = 1 }) =>
      getFeed({
        sort: sortBy,
        page: pageParam,
        lat: userLocation?.lat,
        lon: userLocation?.lon,
      }),
    getNextPageParam: (lastPage) => lastPage.next_page,
    initialPageParam: 1,
  });

  // 좋아요 토글
  const likeMutation = useMutation({
    mutationFn: async ({ photoId, isLiked }: { photoId: string; isLiked: boolean }) => {
      if (isLiked) {
        await unlikePhoto(photoId);
      } else {
        await likePhoto(photoId);
      }
    },
    onMutate: async ({ photoId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueryData<InfiniteData<FeedResponse>>(['feed', sortBy, userLocation]);
      
      queryClient.setQueryData<InfiniteData<FeedResponse>>(['feed', sortBy, userLocation], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            feed: page.feed.map((photo: FeedPhoto) =>
              photo.photo_id === photoId
                ? {
                    ...photo,
                    i_like_this: !isLiked,
                    likes_count: isLiked ? photo.likes_count - 1 : photo.likes_count + 1,
                  }
                : photo
            ),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['feed', sortBy, userLocation], context.previousData);
      }
      alert('좋아요 처리 중 오류가 발생했습니다.');
    },
  });

  // 정렬 변경
  const handleSortChange = useCallback((newSort: SortOption) => {
    if (newSort === 'distance') {
      // GPS 권한 요청
      if (!navigator.geolocation) {
        alert('브라우저가 위치 정보를 지원하지 않습니다.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setSortBy('distance');
        },
        (error) => {
          alert('위치 정보를 가져올 수 없습니다. 설정에서 위치 권한을 허용해주세요.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setSortBy(newSort);
    }
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
    
    if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 사진 확대 모달 열기
  const openLightbox = (photo: FeedPhoto) => {
    setSelectedPhoto(photo);
  };

  // 사진 확대 모달 닫기
  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  const allPhotos = data?.pages.flatMap((page) => page.feed) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary-600">피드</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/matching')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                매칭
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                내 프로필
              </button>
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex gap-2 overflow-x-auto">
            {(['latest', 'popular', 'random', 'distance'] as SortOption[]).map((option) => (
              <button
                key={option}
                onClick={() => handleSortChange(option)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                  sortBy === option
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option === 'latest' && '최신순'}
                {option === 'popular' && '좋아요순'}
                {option === 'random' && '랜덤'}
                {option === 'distance' && '가까운 거리순'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 피드 그리드 */}
      <main
        className="max-w-4xl mx-auto px-4 py-6 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
        onScroll={handleScroll}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allPhotos.map((photo) => (
            <div key={photo.photo_id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* 사용자 정보 */}
              <div className="p-4 flex items-center gap-3">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${photo.user.user_id}`)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{photo.user.nickname}</p>
                    {/* 인증 뱃지 - 학교 축제 인증 */}
                    {photo.verification_status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        학교 축제 인증
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 사진 */}
              <div
                className="cursor-pointer"
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={`${photo.user.nickname}의 사진`}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* 좋아요 버튼 */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      likeMutation.mutate({
                        photoId: photo.photo_id,
                        isLiked: photo.i_like_this,
                      })
                    }
                    className="transition-transform hover:scale-110"
                  >
                    {photo.i_like_this ? (
                      <HeartSolid className="w-7 h-7 text-red-500" />
                    ) : (
                      <HeartOutline className="w-7 h-7 text-gray-700" />
                    )}
                  </button>
                  <span className="text-sm font-semibold">
                    {photo.likes_count} 좋아요
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 로딩 인디케이터 */}
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="text-gray-500">더 불러오는 중...</div>
          </div>
        )}

        {!hasNextPage && allPhotos.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            모든 게시물을 확인했습니다.
          </div>
        )}

        {allPhotos.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            아직 게시물이 없습니다.
          </div>
        )}
      </main>

      {/* 라이트박스 모달 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={selectedPhoto.image_url}
              alt="확대된 사진"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

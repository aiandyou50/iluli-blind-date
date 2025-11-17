import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getFeed, likePhoto, unlikePhoto, FeedPhoto, FeedResponse } from '@/api/feed';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PhotoCard from '@/components/PhotoCard';

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
      <Layout currentPage="feed">
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-600 dark:text-gray-400">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  const allPhotos = data?.pages.flatMap((page) => page.feed) || [];

  return (
    <Layout currentPage="feed">
      {/* 정렬 옵션 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['latest', 'popular', 'random', 'distance'] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleSortChange(option)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                sortBy === option
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-pressed={sortBy === option}
            >
              {option === 'latest' && '최신순'}
              {option === 'popular' && '좋아요순'}
              {option === 'random' && '랜덤'}
              {option === 'distance' && '가까운 거리순'}
            </button>
          ))}
        </div>
      </div>

      {/* 피드 그리드 */}
      <main
        className="px-4 py-6 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {allPhotos.map((photo) => (
            <PhotoCard
              key={photo.photo_id}
              imageUrl={photo.image_url}
              alt={`${photo.user.nickname}의 사진`}
              nickname={photo.user.nickname}
              likesCount={photo.likes_count}
              isLiked={photo.i_like_this}
              isVerified={photo.verification_status === 'approved'}
              aspectRatio="3/4"
              onClick={() => openLightbox(photo)}
              onLike={() =>
                likeMutation.mutate({
                  photoId: photo.photo_id,
                  isLiked: photo.i_like_this,
                })
              }
              onUserClick={() => navigate(`/profile/${photo.user.user_id}`)}
            />
          ))}
        </div>

        {/* 로딩 인디케이터 */}
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mt-4">
            {[1, 2, 3].map((i) => (
              <PhotoCard key={i} imageUrl="" alt="" loading />
            ))}
          </div>
        )}

        {!hasNextPage && allPhotos.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            모든 게시물을 확인했습니다.
          </div>
        )}

        {allPhotos.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            아직 게시물이 없습니다.
          </div>
        )}
      </main>

      {/* 라이트박스 모달 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="확대된 사진"
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="닫기"
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
    </Layout>
  );
}

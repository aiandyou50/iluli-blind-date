import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatchingDeck, performMatchingAction, MatchingCard, MatchData } from '@/api/matching';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Layout from '@/components/Layout';

export default function MatchingPage() {
  const queryClient = useQueryClient();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<MatchData | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 매칭 덱 조회
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matchingDeck'],
    queryFn: getMatchingDeck,
  });

  // 매칭 액션 Mutation
  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'ok' | 'pass' }) =>
      performMatchingAction(userId, action),
    onSuccess: (response) => {
      if (response.matched && response.match) {
        setMatchModal(response.match);
      }
      
      // 다음 카드로 이동
      setCurrentCardIndex((prev) => prev + 1);
      setCurrentPhotoIndex(0);
      
      // 덱의 마지막 카드인 경우 새로운 덱 로드
      if (data && currentCardIndex >= data.deck.length - 1) {
        queryClient.invalidateQueries({ queryKey: ['matchingDeck'] });
      }
    },
  });

  const handleOk = () => {
    if (!currentCard) return;
    actionMutation.mutate({ userId: currentCard.user_id, action: 'ok' });
  };

  const handlePass = () => {
    if (!currentCard) return;
    actionMutation.mutate({ userId: currentCard.user_id, action: 'pass' });
  };

  const closeMatchModal = () => {
    setMatchModal(null);
  };

  const openInstagram = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    // Avoid calling setState synchronously in useEffect (ESLint react-hooks/set-state-in-effect)
    const id = setTimeout(() => setCurrentPhotoIndex(0), 0);
    return () => clearTimeout(id);
  }, [currentCardIndex]);

  if (isLoading) {
    return (
      <Layout currentPage="matching">
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-600 dark:text-gray-400">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  const deck = data?.deck || [];
  const currentCard: MatchingCard | undefined = deck[currentCardIndex];

  if (!currentCard) {
    return (
      <Layout currentPage="matching">
        <main className="px-4 py-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">더 이상 카드가 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              새로운 카드 불러오기
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  const currentPhoto = currentCard.photos[currentPhotoIndex];

  return (
    <Layout currentPage="matching">
      {/* 카드 UI */}
      <main className="px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
          {/* 사진 영역 */}
          <div className="relative">
            <img
              src={currentPhoto?.image_url}
              alt={`${currentCard.nickname}의 사진`}
              className="w-full aspect-[3/4] object-cover"
            />
            
            {/* 사진 네비게이션 점 */}
            {currentCard.photos.length > 1 && (
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                {currentCard.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === currentPhotoIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 w-1'
                    }`}
                    aria-label={`사진 ${index + 1}로 이동`}
                    aria-current={index === currentPhotoIndex}
                  />
                ))}
              </div>
            )}

            {/* 좌우 클릭 영역 */}
            {currentCard.photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev > 0 ? prev - 1 : currentCard.photos.length - 1
                    )
                  }
                  className="absolute left-0 top-0 bottom-0 w-1/3"
                  aria-label="이전 사진"
                />
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev < currentCard.photos.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-0 top-0 bottom-0 w-1/3"
                  aria-label="다음 사진"
                />
              </>
            )}

            {/* 프로필 정보 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{currentCard.nickname}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentCard.school && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {currentCard.school}
                  </span>
                )}
                {currentCard.mbti && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {currentCard.mbti}
                  </span>
                )}
              </div>
              {currentCard.bio && (
                <p className="text-sm opacity-90">{currentCard.bio}</p>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="p-6 flex justify-center gap-6">
            <button
              onClick={handlePass}
              disabled={actionMutation.isPending}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="거절"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <button
              onClick={handleOk}
              disabled={actionMutation.isPending}
              className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="좋아요"
            >
              <HeartIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
          {currentCardIndex + 1} / {deck.length}
        </div>
      </main>

      {/* 매치 성공 모달 */}
      {matchModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <h2 id="match-modal-title" className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
              It's a Match! 🎉
            </h2>
            <div className="mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{matchModal.matched_user.nickname}</span>님과
                매칭되었습니다!
              </p>
            </div>

            <div className="space-y-3">
              {matchModal.matched_user.instagram_url ? (
                <button
                  onClick={() => openInstagram(matchModal.matched_user.instagram_url!)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold transition-colors"
                >
                  인스타그램 DM 보내기
                </button>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                  상대방이 인스타그램을 등록하지 않았습니다.
                </div>
              )}
              <button
                onClick={closeMatchModal}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                계속 탐색하기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

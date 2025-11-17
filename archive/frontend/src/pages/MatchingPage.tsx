import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatchingDeck, performMatchingAction, MatchingCard, MatchData } from '@/api/matching';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function MatchingPage() {
  const navigate = useNavigate();
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
    setCurrentPhotoIndex(0);
  }, [currentCardIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  const deck = data?.deck || [];
  const currentCard: MatchingCard | undefined = deck[currentCardIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary-600">매칭</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/feed')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  피드
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  프로필
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-600 mb-4">더 이상 카드가 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              새로운 카드 불러오기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentPhoto = currentCard.photos[currentPhotoIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">매칭</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/feed')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                피드
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                프로필
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 카드 UI */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 사진 영역 */}
          <div className="relative">
            <img
              src={currentPhoto?.image_url}
              alt={`${currentCard.nickname}의 사진`}
              className="w-full h-[500px] object-cover"
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
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all disabled:opacity-50"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <button
              onClick={handleOk}
              disabled={actionMutation.isPending}
              className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all disabled:opacity-50"
            >
              <HeartIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="text-center mt-4 text-gray-500 text-sm">
          {currentCardIndex + 1} / {deck.length}
        </div>
      </main>

      {/* 매치 성공 모달 */}
      {matchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-primary-600 mb-6">
              It's a Match! 🎉
            </h2>
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">{matchModal.matched_user.nickname}</span>님과
                매칭되었습니다!
              </p>
            </div>

            <div className="space-y-3">
              {matchModal.matched_user.instagram_url ? (
                <button
                  onClick={() => openInstagram(matchModal.matched_user.instagram_url!)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold"
                >
                  인스타그램 DM 보내기
                </button>
              ) : (
                <div className="text-sm text-gray-500 py-3">
                  상대방이 인스타그램을 등록하지 않았습니다.
                </div>
              )}
              <button
                onClick={closeMatchModal}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                계속 탐색하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

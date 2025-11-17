import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/env';

interface Photo {
  id: string;
  image_url: string;
  verification_status: string;
  rejection_reason: string | null;
  created_at: string;
  likes_count: number;
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}

export default function AdminPhotosPage() {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [filter, page]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `${API_BASE_URL}/admin/photos?status=${filter}&page=${page}`
        : `${API_BASE_URL}/admin/photos?page=${page}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setPhotos(response.data.photos);
      setHasMore(!!response.data.next_page);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError('사진 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('이 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setDeletingId(photoId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setPhotos(photos.filter((p) => p.id !== photoId));
      alert('사진이 삭제되었습니다.');
    } catch (err) {
      alert('사진 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      not_applied: { text: '미신청', color: 'bg-gray-100 text-gray-800' },
      pending: { text: '대기중', color: 'bg-orange-100 text-orange-800' },
      approved: { text: '승인됨', color: 'bg-green-100 text-green-800' },
      rejected: { text: '거절됨', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.not_applied;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">사진 관리</h1>
          <p className="mt-2 text-sm text-gray-600">전체 사진 목록 조회 및 삭제</p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => { setFilter(''); setPage(1); }}
              className={`px-4 py-2 rounded-lg ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              전체
            </button>
            <button
              onClick={() => { setFilter('not_applied'); setPage(1); }}
              className={`px-4 py-2 rounded-lg ${filter === 'not_applied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              미신청
            </button>
            <button
              onClick={() => { setFilter('pending'); setPage(1); }}
              className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              대기중
            </button>
            <button
              onClick={() => { setFilter('approved'); setPage(1); }}
              className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              승인됨
            </button>
            <button
              onClick={() => { setFilter('rejected'); setPage(1); }}
              className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              거절됨
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-xl">로딩 중...</div>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">사진이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={photo.image_url}
                      alt="User photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(photo.verification_status)}
                      <span className="text-xs text-gray-500">
                        ❤️ {photo.likes_count}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium">{photo.user.nickname}</p>
                      <p className="text-xs text-gray-500">{photo.user.email}</p>
                    </div>
                    {photo.rejection_reason && (
                      <div className="mb-3 p-2 bg-red-50 rounded text-xs text-red-800">
                        거절 사유: {photo.rejection_reason}
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">
                        {new Date(photo.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      disabled={deletingId === photo.id}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === photo.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2 bg-white rounded-lg shadow">
                페이지 {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </>
        )}

        <div className="mt-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

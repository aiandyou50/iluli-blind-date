import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/env';

interface PendingPhoto {
  id: string;
  image_url: string;
  verification_status: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}

export default function AdminVerificationPage() {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPhotos();
  }, []);

  const fetchPendingPhotos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/photos/pending`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setPhotos(response.data.photos);
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

  const handleApprove = async (photoId: string) => {
    if (!confirm('이 사진을 승인하시겠습니까?')) return;

    setProcessingId(photoId);
    try {
      await axios.post(
        `${API_BASE_URL}/admin/photos/${photoId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setPhotos(photos.filter((p) => p.id !== photoId));
      alert('사진이 승인되었습니다.');
    } catch (err) {
      alert('승인 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (photoId: string) => {
    const reason = prompt('거절 사유를 입력하세요 (선택사항):');
    if (reason === null) return; // 취소

    setProcessingId(photoId);
    try {
      await axios.post(
        `${API_BASE_URL}/admin/photos/${photoId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setPhotos(photos.filter((p) => p.id !== photoId));
      alert('사진이 거절되었습니다.');
    } catch (err) {
      alert('거절 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">사진 인증 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            파트너 포토부스 사진 인증 요청을 처리합니다.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">인증 대기 중인 사진이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={photo.image_url}
                    alt="Pending verification"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">사용자</p>
                    <p className="font-medium">{photo.user.nickname}</p>
                    <p className="text-xs text-gray-500">{photo.user.email}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">신청 일시</p>
                    <p className="text-xs">
                      {new Date(photo.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(photo.id)}
                      disabled={processingId === photo.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingId === photo.id ? '처리 중...' : '승인'}
                    </button>
                    <button
                      onClick={() => handleReject(photo.id)}
                      disabled={processingId === photo.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      거절
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

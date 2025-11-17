import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/env';
import AdminPhotoApprovalModal from '@/components/AdminPhotoApprovalModal';
import type { Photo } from '@/components/AdminPhotoApprovalModal';

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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handlePhotoClick = (photo: PendingPhoto) => {
    const modalPhoto: Photo = {
      ...photo,
      verification_status: photo.verification_status as Photo['verification_status'],
      rejection_reason: null,
      likes_count: 0,
    };
    setSelectedPhoto(modalPhoto);
    setIsModalOpen(true);
  };

  const handleApprove = async (photoId: string) => {
    await axios.post(
      `${API_BASE_URL}/admin/photos/${photoId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleReject = async (photoId: string, reason: string) => {
    await axios.post(
      `${API_BASE_URL}/admin/photos/${photoId}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex items-center justify-center">
        <div className="text-xl dark:text-gray-100">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-danger-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">사진 인증 관리</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            파트너 포토부스 사진 인증 요청을 처리합니다.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white dark:bg-background-dark-secondary rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">인증 대기 중인 사진이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="bg-white dark:bg-background-dark-secondary rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePhotoClick(photo)}
              >
                <div className="aspect-square relative">
                  <img
                    src={photo.image_url}
                    alt="Pending verification"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">사용자</p>
                    <p className="font-medium dark:text-gray-100">{photo.user.nickname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{photo.user.email}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">신청 일시</p>
                    <p className="text-xs dark:text-gray-300">
                      {new Date(photo.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 dark:text-primary-400 hover:text-blue-800 dark:hover:text-primary-300 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>

      <AdminPhotoApprovalModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

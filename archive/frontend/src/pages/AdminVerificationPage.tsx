import { useState, useEffect, useCallback } from 'react';
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
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const fetchPendingPhotos = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/photos/pending`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setPhotos(response.data.photos);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError('사진 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    fetchPendingPhotos();
  }, [fetchPendingPhotos]);

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

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPhotos.size === 0) {
      alert('승인할 사진을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedPhotos.size}개의 사진을 일괄 승인하시겠습니까?`)) {
      return;
    }

    setIsBulkApproving(true);
    try {
      // 병렬로 모든 승인 요청 실행
      await Promise.all(
        Array.from(selectedPhotos).map(photoId =>
          axios.post(
            `${API_BASE_URL}/admin/photos/${photoId}/approve`,
            {},
            { headers: { Authorization: `Bearer ${idToken}` } }
          )
        )
      );

      // 승인된 사진들 제거
      setPhotos(photos.filter(p => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
      alert(`${selectedPhotos.size}개의 사진이 승인되었습니다.`);
    } catch (error) {
      console.error(error);
      alert('일괄 승인 중 오류가 발생했습니다.');
    } finally {
      setIsBulkApproving(false);
    }
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

        {/* 일괄 승인 컨트롤 */}
        {photos.length > 0 && (
          <div className="bg-white dark:bg-background-dark-secondary rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.size === photos.length && photos.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    전체 선택 ({selectedPhotos.size}/{photos.length})
                  </span>
                </label>
              </div>
              <button
                onClick={handleBulkApprove}
                disabled={selectedPhotos.size === 0 || isBulkApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isBulkApproving ? '승인 중...' : `선택한 ${selectedPhotos.size}개 일괄 승인`}
              </button>
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="bg-white dark:bg-background-dark-secondary rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">인증 대기 중인 사진이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="bg-white dark:bg-background-dark-secondary rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative">
                  {/* 체크박스 */}
                  <div 
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPhotos.has(photo.id)}
                      onChange={() => togglePhotoSelection(photo.id)}
                      className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                  <img
                    src={photo.image_url}
                    alt="Pending verification"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
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

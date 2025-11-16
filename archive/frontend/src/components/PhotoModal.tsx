import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ProfilePhoto } from '@/types/profile';

interface PhotoModalProps {
  photo: ProfilePhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (photoId: string) => void;
  onVerifyFestival: (photoId: string) => void;
}

/**
 * Modal component for displaying enlarged profile photos
 * Shows photo with delete button, festival verification button, and like count
 */
export default function PhotoModal({
  photo,
  isOpen,
  onClose,
  onDelete,
  onVerifyFestival,
}: PhotoModalProps) {
  if (!photo) return null;

  const handleDelete = () => {
    if (confirm('정말 이 사진을 삭제하시겠습니까?')) {
      onDelete(photo.id);
      onClose();
    }
  };

  const handleVerifyFestival = () => {
    onVerifyFestival(photo.id);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Photo */}
                <div className="mb-4">
                  <img
                    src={photo.image_url}
                    alt="프로필 사진"
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* Photo info */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Like count */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">{photo.likes_count}</span>
                      <span className="text-sm text-gray-500">좋아요</span>
                    </div>

                    {/* Verification status */}
                    <div className="text-sm">
                      {photo.verification_status === 'approved' && (
                        <span className="text-green-600">✅ 인증 승인됨</span>
                      )}
                      {photo.verification_status === 'pending' && (
                        <span className="text-orange-600">⏳ 인증 대기중</span>
                      )}
                      {photo.verification_status === 'rejected' && (
                        <span className="text-red-600">❌ 인증 거절됨</span>
                      )}
                      {photo.verification_status === 'not_applied' && (
                        <span className="text-gray-600">🔒 인증 미신청</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection reason */}
                {photo.verification_status === 'rejected' && photo.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>거절 사유:</strong> {photo.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                  {photo.verification_status === 'not_applied' && (
                    <button
                      onClick={handleVerifyFestival}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      학교축제 인증하기
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

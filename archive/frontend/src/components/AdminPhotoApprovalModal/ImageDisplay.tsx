import { HeartIcon } from '@heroicons/react/24/solid';
import type { Photo } from './types';

interface ImageDisplayProps {
  photo: Photo;
}

/**
 * Image display component with photo information
 * Displays the photo, user details, and like count
 */
export default function ImageDisplay({ photo }: ImageDisplayProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      not_applied: { 
        text: '미신청', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
      },
      pending: { 
        text: '승인 대기중', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
      },
      approved: { 
        text: '승인됨', 
        color: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300' 
      },
      rejected: { 
        text: '거절됨', 
        color: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' 
      },
    };
    return badges[status as keyof typeof badges] || badges.not_applied;
  };

  const badge = getStatusBadge(photo.verification_status);

  return (
    <div className="space-y-4">
      {/* Photo */}
      <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={photo.image_url}
          alt={`${photo.user.nickname}의 프로필 사진`}
          className="w-full h-auto max-h-[60vh] object-contain"
        />
      </div>

      {/* Photo Information */}
      <div className="flex items-center justify-between p-4 bg-background-light-secondary dark:bg-background-dark-secondary rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
              {badge.text}
            </span>
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <HeartIcon className="w-5 h-5 text-danger-500" />
              <span className="font-medium">{photo.likes_count}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">좋아요</span>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {photo.user.nickname}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {photo.user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Reason Display */}
      {photo.verification_status === 'rejected' && photo.rejection_reason && (
        <div 
          className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
          role="alert"
        >
          <p className="text-sm font-medium text-danger-800 dark:text-danger-300">
            <strong>거절 사유:</strong> {photo.rejection_reason}
          </p>
        </div>
      )}
    </div>
  );
}

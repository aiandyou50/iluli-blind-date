import { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface PhotoCardProps {
  imageUrl: string;
  alt: string;
  nickname?: string;
  school?: string;
  likesCount?: number;
  isLiked?: boolean;
  isVerified?: boolean;
  aspectRatio?: '1/1' | '3/4' | '4/3' | '16/9';
  showUserInfo?: boolean;
  showLikeButton?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onUserClick?: () => void;
  loading?: boolean;
}

/**
 * Unified PhotoCard component for displaying photos with consistent styling
 * Supports different aspect ratios, like button, verification badge, and loading states
 */
export default function PhotoCard({
  imageUrl,
  alt,
  nickname,
  school,
  likesCount,
  isLiked = false,
  isVerified = false,
  aspectRatio = '1/1',
  showUserInfo = true,
  showLikeButton = true,
  onClick,
  onLike,
  onUserClick,
  loading = false,
}: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse">
        {showUserInfo && (
          <div className="p-4 flex items-center gap-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        )}
        <div className={`bg-gray-200 dark:bg-gray-700 w-full`} style={{ aspectRatio }}></div>
        {showLikeButton && (
          <div className="p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-transform hover:scale-[1.02]">
      {/* User Info Header */}
      {showUserInfo && (nickname || school) && (
        <div className="p-4 flex items-center gap-3">
          <div
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onUserClick?.();
            }}
            role={onUserClick ? 'button' : undefined}
            tabIndex={onUserClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onUserClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onUserClick();
              }
            }}
          >
            <div className="flex items-center gap-2">
              {nickname && (
                <p className="font-semibold text-gray-900 dark:text-gray-100">{nickname}</p>
              )}
              {isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  <CheckBadgeIcon className="w-3 h-3 mr-1" />
                  학교 축제 인증
                </span>
              )}
            </div>
            {school && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{school}</p>
            )}
          </div>
        </div>
      )}

      {/* Photo */}
      <div
        className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        style={{ aspectRatio }}
      >
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        )}

        {/* Image */}
        {!imageError ? (
          <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          /* Error placeholder */
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs">이미지를 불러올 수 없습니다</p>
            </div>
          </div>
        )}
      </div>

      {/* Like Button */}
      {showLikeButton && (
        <div className="p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
              aria-label={isLiked ? '좋아요 취소' : '좋아요'}
              aria-pressed={isLiked}
            >
              {isLiked ? (
                <HeartSolid className="w-7 h-7 text-red-500" />
              ) : (
                <HeartOutline className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            {likesCount !== undefined && (
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {likesCount} 좋아요
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

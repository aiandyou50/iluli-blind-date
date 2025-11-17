import { API_BASE_URL } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import type { ProfileResponse, ProfileUpdateRequest, PhotoUploadResponse } from '@/types/profile';

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { idToken } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (idToken) {
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

/**
 * GET /profile - 내 프로필 조회
 */
export async function getMyProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/profile');
}

/**
 * PATCH /profile - 내 프로필 수정
 */
export async function updateMyProfile(data: ProfileUpdateRequest): Promise<{ message: string }> {
  return apiRequest('/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * POST /profile/photos/upload - 사진 업로드
 */
export async function uploadPhoto(file: File): Promise<PhotoUploadResponse> {
  const { idToken } = useAuthStore.getState();

  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${API_BASE_URL}/profile/photos/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Photo upload failed');
  }

  return response.json();
}

/**
 * POST /profile/photos/:photoId/request-verification - 사진 인증 요청
 */
export async function requestPhotoVerification(photoId: string): Promise<{ message: string }> {
  return apiRequest(`/profile/photos/${photoId}/request-verification`, {
    method: 'POST',
  });
}

/**
 * DELETE /profile/photos/:photoId - 사진 삭제
 */
export async function deletePhoto(photoId: string): Promise<{ message: string }> {
  return apiRequest(`/profile/photos/${photoId}`, {
    method: 'DELETE',
  });
}

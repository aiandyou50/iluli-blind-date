import { API_BASE_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';

/**
 * 타 사용자의 공개 프로필 조회 (PRD-USER-002)
 */
export async function getUserProfile(userId: string) {
  const idToken = useAuthStore.getState().idToken;

  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

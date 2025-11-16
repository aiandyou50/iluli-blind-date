import { API_BASE_URL } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

/**
 * Check if the current user has admin privileges
 */
export async function checkAdminStatus(): Promise<boolean> {
  const { idToken } = useAuthStore.getState();
  
  if (!idToken) {
    return false;
  }

  try {
    // Try to fetch admin stats - if successful, user is admin
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

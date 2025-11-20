import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { checkAdminStatus } from '@/api/admin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component for admin-only pages
 * Checks both authentication and admin role
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
      setIsLoading(false);
    }

    verifyAdmin();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">권한 확인 중...</div>
      </div>
    );
  }

  // Redirect to main page if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    // If user is authenticated but not admin, show an explanatory page rather than redirect
    if (isAuthenticated && isAdmin === false) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-md max-w-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">관리자 권한이 필요합니다</h2>
            <p className="text-sm text-gray-600 mb-6">현재 계정은 관리자 권한이 없습니다. 관리자에게 권한을 요청하거나 관리자에게 문의하세요.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                메인으로 돌아가기
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">문제가 계속되면 관리자에게 문의하여 권한을 확인하세요.</p>
          </div>
        </div>
      );
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

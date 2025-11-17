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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

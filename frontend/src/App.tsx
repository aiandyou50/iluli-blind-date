import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import FeedPage from '@/pages/FeedPage';
import MatchingPage from '@/pages/MatchingPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminVerificationPage from '@/pages/AdminVerificationPage';
import AdminPhotosPage from '@/pages/AdminPhotosPage';
import AdminUsersPage from '@/pages/AdminUsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <MatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verification"
            element={
              <ProtectedRoute>
                <AdminVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/photos"
            element={
              <ProtectedRoute>
                <AdminPhotosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import NewProfilePage from '@/pages/NewProfilePage';
import NewPublicProfilePage from '@/pages/NewPublicProfilePage';
import NewFeedPage from '@/pages/NewFeedPage';
import NewMatchingPage from '@/pages/NewMatchingPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminVerificationPage from '@/pages/AdminVerificationPage';
import NewAdminPhotosPage from '@/pages/NewAdminPhotosPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

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
                <NewFeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <NewMatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <NewProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <NewPublicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/verification"
            element={
              <AdminProtectedRoute>
                <AdminVerificationPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/photos"
            element={
              <AdminProtectedRoute>
                <NewAdminPhotosPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsersPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: 'feed' | 'matching' | 'profile';
}

export default function Layout({ children, currentPage }: LayoutProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-google sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  이루리
                </span>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => navigate('/feed')}
                className={`px-4 py-2 rounded-google text-sm font-medium transition-colors ${
                  currentPage === 'feed'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                피드
              </button>
              <button
                onClick={() => navigate('/matching')}
                className={`px-4 py-2 rounded-google text-sm font-medium transition-colors ${
                  currentPage === 'matching'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                매칭
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`px-4 py-2 rounded-google text-sm font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                프로필
              </button>
            </nav>

            {/* 로그아웃 버튼 */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 모바일 네비게이션 */}
          <div className="md:hidden pb-3 flex space-x-1">
            <button
              onClick={() => navigate('/feed')}
              className={`flex-1 px-3 py-2 rounded-google text-sm font-medium transition-colors ${
                currentPage === 'feed'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              피드
            </button>
            <button
              onClick={() => navigate('/matching')}
              className={`flex-1 px-3 py-2 rounded-google text-sm font-medium transition-colors ${
                currentPage === 'matching'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              매칭
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`flex-1 px-3 py-2 rounded-google text-sm font-medium transition-colors ${
                currentPage === 'profile'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              프로필
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main>{children}</main>
    </div>
  );
}

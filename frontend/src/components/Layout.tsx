import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import LanguageSelector from './LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: 'feed' | 'matching' | 'profile';
}

export default function Layout({ children, currentPage }: LayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Main App Frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white dark:bg-black overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('auth.logout')}
            </button>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        {/* Fixed Bottom Navigation */}
        <nav className="fixed bottom-0 z-10 w-full max-w-md border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm">
          <div className="flex h-16 justify-around">
            <button
              onClick={() => navigate('/feed')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${
                currentPage === 'feed'
                  ? 'text-primary-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'feed' ? "'FILL' 1" : "'FILL' 0" }}>
                home
              </span>
              <p className="text-xs font-bold">{t('navigation.feed')}</p>
            </button>
            <button
              onClick={() => navigate('/matching')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${
                currentPage === 'matching'
                  ? 'text-primary-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'matching' ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
              <p className="text-xs font-bold">{t('navigation.matching')}</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`flex flex-1 flex-col items-center justify-center gap-1 pt-2.5 ${
                currentPage === 'profile'
                  ? 'text-primary-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>
                person
              </span>
              <p className="text-xs font-bold">{t('navigation.profile')}</p>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

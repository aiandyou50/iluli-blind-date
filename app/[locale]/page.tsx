'use client';

import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();

  const handleGoogleLogin = () => {
    // [EN] Initiate Google login flow and redirect to feed on success
    // [KR] Google 로그인 흐름을 시작하고 성공 시 피드로 리다이렉트
    signIn('google', { callbackUrl: '/feed' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      {/* Top Bar with Language Switcher */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      <main className="flex flex-1 flex-col items-center px-4 pt-10 pb-20 text-center">
        {/* Google Login Button Section */}
        <div className="mb-16 w-full max-w-xs">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-8 py-4 text-lg font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.loginWithGoogle')}
          </button>
        </div>

        {/* Landing Page Content */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-5xl font-bold text-pink-600 dark:text-pink-400">
            💕
          </h1>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('common.appName')}
          </h2>
          <p className="max-w-md text-lg text-gray-600 dark:text-gray-300">
            {t('onboarding.welcome')}
          </p>
          
          <div className="mt-8 grid gap-8 text-left md:grid-cols-2 max-w-2xl">
            <div className="rounded-xl bg-pink-50 p-6 dark:bg-gray-800">
              <h3 className="mb-2 text-xl font-semibold text-pink-700 dark:text-pink-400">
                {t('landing.simpleMatchingTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.simpleMatchingDesc')}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-6 dark:bg-gray-800">
              <h3 className="mb-2 text-xl font-semibold text-purple-700 dark:text-purple-400">
                {t('landing.verifiedUsersTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.verifiedUsersDesc')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

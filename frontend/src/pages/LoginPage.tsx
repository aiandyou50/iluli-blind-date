import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_CLIENT_ID } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { t } = useTranslation();
  const setIdToken = useAuthStore((state) => state.setIdToken);
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback((response: { credential: string }) => {
    // Google ID Token 저장
    setIdToken(response.credential);

    // 프로필 페이지로 이동
    navigate('/profile');
  }, [setIdToken, navigate]);

  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services not available');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        // Clear any existing button first
        buttonDiv.innerHTML = '';
        
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'ko',
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    // Check if Google Identity Services script is already loaded
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (existingScript) {
      // Script already exists, initialize if Google API is available
      if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
      } else {
        // Wait for script to load
        existingScript.addEventListener('load', initializeGoogleSignIn);
      }
      return;
    }

    // Google Identity Services 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeGoogleSignIn();
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
    };

    document.body.appendChild(script);

    // Cleanup: Only remove if we added it
    return () => {
      // Don't remove script on unmount to prevent re-loading on navigation
      // The script can be safely reused across page visits
    };
  }, [initializeGoogleSignIn]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="text-center mb-12">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-google-lg mb-4">
              <span className="text-4xl" role="img" aria-label="heart">💙</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light">{t('app.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-google shadow-google-lg p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">{t('auth.login')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Google 계정으로 간편하게 로그인하세요
              </p>
            </div>

            {/* Google Sign-In Button */}
            <div 
              id="google-signin-button" 
              className="flex justify-center min-h-[44px]"
              data-testid="google-signin-button"
              role="region"
              aria-label="Google Sign-In"
            >
              {/* Google button will be rendered here */}
            </div>

            {/* Fallback message if Google Sign-In fails to load */}
            <noscript>
              <div className="text-center text-sm text-red-600 dark:text-red-400">
                JavaScript가 필요합니다. 브라우저 설정에서 JavaScript를 활성화해주세요.
              </div>
            </noscript>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">안전하고 빠른 로그인</span>
              </div>
            </div>



            <div className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              로그인 시 <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">이용약관</a> 및{' '}
              <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">개인정보처리방침</a>에 동의하게 됩니다.
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 {t('app.title')}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

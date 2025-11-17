import { useEffect } from 'react';
import { GOOGLE_CLIENT_ID } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const setIdToken = useAuthStore((state) => state.setIdToken);
  const navigate = useNavigate();

  useEffect(() => {
    // Google Identity Services 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'ko',
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response: { credential: string }) => {
    // Google ID Token 저장
    setIdToken(response.credential);
    
    // 프로필 페이지로 이동
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-google-lg mb-4">
              <span className="text-4xl">💙</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
            이루리
          </h1>
          <p className="text-xl text-gray-600 font-light">대학생을 위한 소개팅 플랫폼</p>
        </div>

        <div className="bg-white rounded-google shadow-google-lg p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-800 mb-2">시작하기</h2>
              <p className="text-sm text-gray-600 mb-6">
                Google 계정으로 간편하게 로그인하세요
              </p>
            </div>

            {/* Google Sign-In Button */}
            <div id="google-signin-button" className="flex justify-center"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">안전하고 빠른 로그인</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-google p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    개인정보는 안전하게 보호됩니다. 승인된 사진만 다른 사용자에게 공개됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center leading-relaxed">
              로그인 시 <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">이용약관</a> 및{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">개인정보처리방침</a>에 동의하게 됩니다.
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 이루리. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

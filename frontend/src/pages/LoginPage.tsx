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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">이루리</h1>
          <p className="text-gray-600">대학생을 위한 소개팅 플랫폼</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Google 계정으로 시작하세요
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div id="google-signin-button" className="flex justify-center"></div>

          <div className="text-xs text-gray-400 text-center">
            로그인 시 <a href="#" className="text-primary-500 hover:underline">이용약관</a> 및{' '}
            <a href="#" className="text-primary-500 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Top Bar with Language Switcher */}
      <div className="absolute top-0 right-0 z-50 p-4">
        <LanguageSwitcher />
      </div>

      {/* ==========================================
           HERO SECTION
           (Gradient Background, Main CTA, Headline)
      ========================================== */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-pink-50 via-white to-white px-6 py-20 text-center md:px-12 lg:py-28">
          
          {/* Background Decorations (Blobs) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute bg-purple-300 w-64 h-64 top-10 left-10 rounded-full filter blur-[80px] opacity-30"></div>
              <div className="absolute bg-pink-300 w-80 h-80 top-20 right-10 rounded-full filter blur-[80px] opacity-30"></div>
          </div>

          <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
              
              {/* 1. Brand Badge */}
              <div className="mb-8 animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-sm">
                  <svg className="h-4 w-4 text-pink-500 fill-current animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  <span className="text-sm font-bold tracking-wide text-gray-800">{t('common.appName')}</span>
              </div>

              {/* 2. Main Headline */}
              <h1 className="mb-8 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl animate-fade-in-up">
                  {t('common.appName')} <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                    {t('auth.welcome')}
                  </span>
              </h1>

              {/* 3. Google Login Button (Center & First Priority) */}
              <div className="w-full max-w-sm animate-fade-in-up delay-100 mb-8">
                  <button 
                    onClick={handleGoogleLogin}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white border-2 border-gray-100 px-8 py-5 text-lg font-bold text-gray-700 shadow-xl transition-all hover:-translate-y-1 hover:border-pink-200 hover:shadow-2xl hover:shadow-pink-100 active:scale-95"
                  >
                      {/* Google SVG Icon */}
                      <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>{t('auth.loginWithGoogle')}</span>
                  </button>
                  <p className="mt-3 text-xs text-gray-400">{t('landing.safeLogin')}</p>
              </div>

              {/* 4. Sub Description */}
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl animate-fade-in-up delay-200">
                  {t('landing.heroSubtitle')}
              </p>
          </div>
      </section>

      {/* ==========================================
           FEATURES SECTION (Why Iluli?)
           (3-Column Grid)
      ========================================== */}
      <section className="bg-white px-6 py-16 md:px-12 border-t border-gray-100">
          <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                  <span className="text-pink-500 font-bold text-sm tracking-wider uppercase">{t('landing.whyIluli')}</span>
                  <h2 className="mt-2 text-3xl font-bold text-gray-900">{t('landing.specialFeatures')}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  {/* Feature 1: Verification */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-pink-100">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-pink-500 shadow-md group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.feature1Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500">{t('landing.feature1Desc')}</p>
                  </div>

                  {/* Feature 2: Instagram Sync */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-100">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-md group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.feature2Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500">{t('landing.feature2Desc')}</p>
                  </div>

                  {/* Feature 3: Privacy */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900">{t('landing.feature3Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500">{t('landing.feature3Desc')}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
           HOW IT WORKS SECTION (Process)
           (Step-by-Step Visualization)
      ========================================== */}
      <section className="bg-gradient-to-b from-white to-pink-50 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                  <span className="text-purple-600 font-bold text-sm tracking-wider uppercase">{t('landing.process')}</span>
                  <h2 className="mt-2 text-3xl font-bold text-gray-900">{t('landing.howItWorks')}</h2>
              </div>

              <div className="relative">
                  {/* Vertical Line (Desktop) */}
                  <div className="absolute left-1/2 top-0 hidden h-full w-0.5 bg-gray-200 md:block -translate-x-1/2"></div>

                  <div className="space-y-16 relative">
                      {/* Step 1 */}
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                          <div className="flex-1 md:text-right">
                              <h3 className="text-xl font-bold text-gray-900">{t('landing.step1Title')}</h3>
                              <p className="mt-2 text-gray-500">{t('landing.step1Desc')}</p>
                          </div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg ring-8 ring-white">
                              <span className="font-bold text-xl">1</span>
                          </div>
                          <div className="flex-1 hidden md:block"></div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                          <div className="flex-1 hidden md:block"></div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg ring-8 ring-white">
                              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                          </div>
                          <div className="flex-1 md:text-left">
                              <h3 className="text-xl font-bold text-gray-900">{t('landing.step2Title')}</h3>
                              <p className="mt-2 text-gray-500">{t('landing.step2Desc')}</p>
                          </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                          <div className="flex-1 md:text-right">
                              <h3 className="text-xl font-bold text-gray-900">{t('landing.step3Title')}</h3>
                              <p className="mt-2 text-gray-500">{t('landing.step3Desc')}</p>
                          </div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-8 ring-white">
                              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                          </div>
                          <div className="flex-1 hidden md:block"></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-10 text-center bg-white border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <svg className="h-4 w-4 text-gray-500 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <span className="text-sm font-semibold tracking-wide text-gray-900">{t('common.appName')}</span>
          </div>
          <p className="text-xs text-gray-400">{t('landing.footerRights')}</p>
      </footer>
    </div>
  );
}

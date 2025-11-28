'use client';

import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations();

  const handleGoogleLogin = () => {
    // [EN] Initiate Google login flow and redirect to matching on success
    // [KR] Google 로그인 흐름을 시작하고 성공 시 매칭으로 리다이렉트
    signIn('google', { callbackUrl: '/matching' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white">
      {/* [EN] Top Bar with Language Switcher / [KR] 언어 선택기가 있는 상단 바 */}
      <div className="absolute top-0 end-0 z-50 p-4">
        <LanguageSwitcher />
      </div>

      {/* ==========================================
           HERO SECTION
           (Gradient Background, Main CTA, Headline)
      ========================================== */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-pink-50 via-purple-50/30 to-white dark:from-pink-950/20 dark:via-purple-950/10 dark:to-zinc-900 px-6 py-24 text-center md:px-12 lg:py-32">
          
          {/* [EN] Background Decorations (Blobs) / [KR] 배경 장식 (블롭) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute bg-purple-400 w-72 h-72 -top-20 -start-20 rounded-full filter blur-[100px] opacity-20 dark:opacity-10"></div>
              <div className="absolute bg-pink-400 w-96 h-96 top-20 end-0 rounded-full filter blur-[100px] opacity-20 dark:opacity-10"></div>
              <div className="absolute bg-blue-400 w-64 h-64 bottom-0 start-1/4 rounded-full filter blur-[100px] opacity-10 dark:opacity-5"></div>
          </div>

          <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
              
              {/* [EN] Brand Badge / [KR] 브랜드 배지 */}
              <div className="mb-8 animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-pink-100 dark:border-pink-900/50 bg-white/90 dark:bg-zinc-800/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                  <svg className="h-4 w-4 text-pink-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                  </svg>
                  <span className="text-sm font-bold tracking-wide text-gray-800 dark:text-gray-200">{t('common.appName')}</span>
              </div>

              {/* [EN] Main Headline / [KR] 메인 헤드라인 */}
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl animate-fade-in-up">
                  {t('common.appName')}
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {t('auth.welcome')}
                  </span>
              </h1>

              {/* [EN] Sub Description / [KR] 서브 설명 */}
              <p className="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg mb-10 animate-fade-in-up">
                  {t('landing.heroSubtitle')}
              </p>

              {/* [EN] Google Login Button (Center & First Priority) / [KR] 구글 로그인 버튼 (중앙 & 최우선) */}
              <div className="w-full max-w-sm animate-fade-in-up">
                  <button 
                    onClick={handleGoogleLogin}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 px-8 py-5 text-lg font-bold text-gray-700 dark:text-gray-200 shadow-xl shadow-pink-100/50 dark:shadow-pink-900/20 transition-all hover:-translate-y-1 hover:border-pink-200 dark:hover:border-pink-700 hover:shadow-2xl hover:shadow-pink-200/50 dark:hover:shadow-pink-800/30 active:scale-95"
                  >
                      {/* [EN] Google SVG Icon / [KR] 구글 SVG 아이콘 */}
                      <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>{t('auth.loginWithGoogle')}</span>
                  </button>
                  <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">{t('landing.safeLogin')}</p>
              </div>
          </div>
      </section>

      {/* ==========================================
           FEATURES SECTION (Why Iluli?)
           (3-Column Grid)
      ========================================== */}
      <section className="bg-white dark:bg-zinc-900 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
              <div className="mb-14 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-bold text-sm tracking-wider uppercase mb-4">{t('landing.whyIluli')}</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('landing.specialFeatures')}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                  {/* [EN] Feature 1: Verification / [KR] 기능 1: 인증 */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-pink-900/10 transition-all duration-300 border border-transparent hover:border-pink-100 dark:hover:border-pink-900/50">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-700 text-pink-500 shadow-md group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all duration-300">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{t('landing.feature1Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('landing.feature1Desc')}</p>
                  </div>

                  {/* [EN] Feature 2: Instagram Sync / [KR] 기능 2: 인스타그램 연동 */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-900/10 transition-all duration-300 border border-transparent hover:border-purple-100 dark:hover:border-purple-900/50">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-700 text-purple-600 shadow-md group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{t('landing.feature2Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('landing.feature2Desc')}</p>
                  </div>

                  {/* [EN] Feature 3: Privacy / [KR] 기능 3: 프라이버시 */}
                  <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/10 transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-700 text-blue-600 shadow-md group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{t('landing.feature3Title')}</h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('landing.feature3Desc')}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* ==========================================
           HOW IT WORKS SECTION (Process)
           (Step-by-Step Visualization)
      ========================================== */}
      <section className="bg-gradient-to-b from-white via-pink-50/50 to-white dark:from-zinc-900 dark:via-pink-950/10 dark:to-zinc-900 px-6 py-24 md:px-12">
          <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm tracking-wider uppercase mb-4">{t('landing.process')}</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('landing.howItWorks')}</h2>
              </div>

              <div className="relative">
                  {/* [EN] Vertical Line (Desktop) / [KR] 수직선 (데스크톱) */}
                  <div className="absolute start-1/2 top-0 hidden h-full w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-blue-300 dark:from-pink-700 dark:via-purple-700 dark:to-blue-700 md:block -translate-x-1/2"></div>

                  <div className="space-y-12 md:space-y-16 relative">
                      {/* [EN] Step 1 / [KR] 단계 1 */}
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                          <div className="flex-1 md:text-end">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('landing.step1Title')}</h3>
                              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('landing.step1Desc')}</p>
                          </div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30 ring-4 ring-white dark:ring-zinc-900">
                              <span className="font-bold text-xl">1</span>
                          </div>
                          <div className="flex-1 hidden md:block"></div>
                      </div>

                      {/* [EN] Step 2 / [KR] 단계 2 */}
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                          <div className="flex-1 hidden md:block"></div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30 ring-4 ring-white dark:ring-zinc-900">
                              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                          </div>
                          <div className="flex-1 md:text-start">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('landing.step2Title')}</h3>
                              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('landing.step2Desc')}</p>
                          </div>
                      </div>

                      {/* [EN] Step 3 / [KR] 단계 3 */}
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                          <div className="flex-1 md:text-end">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('landing.step3Title')}</h3>
                              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('landing.step3Desc')}</p>
                          </div>
                          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ring-4 ring-white dark:ring-zinc-900">
                              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                          </div>
                          <div className="flex-1 hidden md:block"></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      
      {/* [EN] Footer / [KR] 푸터 */}
      <footer className="mt-auto py-12 text-center bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
              </svg>
              <span className="text-sm font-bold tracking-wide text-gray-900 dark:text-white">{t('common.appName')}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('landing.footerRights')}</p>
      </footer>
    </div>
  );
}

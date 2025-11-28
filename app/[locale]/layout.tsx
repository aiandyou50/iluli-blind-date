import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/Providers';
import "./globals.css";

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "이루리 소개팅 - Iluli Blind Date",
  description: "20대 대학생 대상 소셜 매칭 서비스",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  
  // [EN] Ensure that the incoming locale is valid / [KR] 입력된 로케일이 유효한지 확인
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }
 
  // [EN] Providing all messages to the client side is the easiest way to get started
  // [KR] 클라이언트 측에 모든 메시지를 제공하는 것이 시작하기 가장 쉬운 방법입니다
  const messages = await getMessages();

  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className="antialiased font-display bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {/* [EN] Full width responsive layout - no fixed max-width / [KR] 전체 너비 반응형 레이아웃 - 고정 max-width 없음 */}
            <div className="min-h-screen w-full">
              {children}
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

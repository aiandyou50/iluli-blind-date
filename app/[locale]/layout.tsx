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
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'zh-TW' | 'zh-CN')) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className="antialiased font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 h-full">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen w-full justify-center">
              <div className="relative flex w-full max-w-[480px] flex-col bg-white dark:bg-black min-h-screen shadow-2xl">
                {children}
              </div>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

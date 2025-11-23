'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <select
      defaultValue={locale}
      onChange={onSelectChange}
      disabled={isPending}
      className="h-8 rounded-md border-gray-300 bg-transparent py-0 pl-2 pr-7 text-sm text-gray-500 focus:ring-2 focus:ring-primary/50 dark:text-gray-400"
    >
      <option value="ko">한국어</option>
      <option value="en">English</option>
      <option value="zh-CN">中文 (简体)</option>
      <option value="zh-TW">中文 (繁體)</option>
      <option value="ru">Русский</option>
      <option value="vi">Tiếng Việt</option>
      <option value="uz">Oʻzbekcha</option>
      <option value="mn">Монгол</option>
      <option value="ne">नेपाली</option>
      <option value="fa">فارسی</option>
      <option value="es">Español</option>
    </select>
  );
}

import { useTranslations } from 'next-intl';

export default function FeedPage() {
  const t = useTranslations('feed');

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-600 dark:text-gray-300 text-center">
          {t('noPhotos')}
        </p>
      </div>
    </div>
  );
}

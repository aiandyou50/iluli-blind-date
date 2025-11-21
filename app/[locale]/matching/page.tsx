import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function MatchingPage() {
  const t = useTranslations('common');

  return (
    <>
      <Header title="Matching" />
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-4 pb-24">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary mb-4">favorite</span>
          <h2 className="text-2xl font-bold mb-2">Find Your Match</h2>
          <p className="text-gray-500">Swipe right to like, left to pass!</p>
          <p className="text-sm text-gray-400 mt-4">(Coming Soon)</p>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

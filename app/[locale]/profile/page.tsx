import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import UserGreeting from '@/components/UserGreeting';

export default function ProfilePage() {
  const t = useTranslations('common');

  return (
    <>
      <Header title="My Profile" />
      <main className="flex flex-col gap-4 p-4 pb-24">
        <UserGreeting />
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <h2 className="text-xl font-bold">My Name</h2>
            <p className="text-gray-500">University Student</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold">
              Edit Profile
            </button>
            <button className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold">
              Settings
            </button>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

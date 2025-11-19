import GlobalLayout from '@/components/GlobalLayout';

export default function ProfilePage() {
  return (
    <GlobalLayout>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <span className="material-symbols-outlined text-8xl text-primary mb-4">person</span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            My Profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your profile and settings
          </p>
        </div>
      </div>
    </GlobalLayout>
  );
}

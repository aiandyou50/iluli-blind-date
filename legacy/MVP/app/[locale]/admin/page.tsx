'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  
  const [activeTab, setActiveTab] = useState<'users' | 'photos'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // Check if user is admin via API or session
    // Since session might not have role updated immediately, we rely on API 403/401
    // But for better UX, we can check session if we added role to it.
    // For now, let's try to fetch. If 403/401, we redirect.
    fetchData();
  }, [session, status, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/admin/users' : '/api/admin/photos';
      const res = await fetch(endpoint);
      
      if (res.status === 401 || res.status === 403) {
        setIsAuthorized(false);
        router.push('/'); // Redirect to home if unauthorized
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      if (activeTab === 'users') {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setPhotos(Array.isArray(data) ? data : []);
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (session && loading && !isAuthorized)) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm(t('confirmDeleteUser'))) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm(t('confirmDeletePhoto'))) return;
    try {
      await fetch(`/api/admin/photos?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header title={t('dashboardTitle')} />
      <main className="p-4 pb-24 max-w-4xl mx-auto">
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            {t('usersTab')}
          </button>
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'photos' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setActiveTab('photos')}
          >
            {t('photosTab')}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">{t('loading')}</div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">{t('colName')}</th>
                  <th className="px-6 py-3">{t('colEmail')}</th>
                  <th className="px-6 py-3">{t('colRole')}</th>
                  <th className="px-6 py-3">{t('colStats')}</th>
                  <th className="px-6 py-3">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium">{user.name || 'No Name'}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role || 'USER'}</td>
                    <td className="px-6 py-4">
                      {t('photos')}: {user._count?.photos || 0}<br/>
                      {t('likes')}: {user._count?.likes || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
                <img src={photo.url} alt="User photo" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col text-white p-2">
                  <p className="text-xs mb-2">{photo.user?.name}</p>
                  <button 
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

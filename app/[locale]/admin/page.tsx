'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useSession, signIn } from 'next-auth/react';
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
      // Don't redirect, just stop loading so we can show login
      setLoading(false);
      return;
    }

    fetchData();
  }, [session, status, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/admin/users' : '/api/admin/photos';
      const res = await fetch(endpoint);
      
      if (res.status === 401 || res.status === 403) {
        setIsAuthorized(false);
        // Don't redirect, just show unauthorized state
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

  if (!session || !isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Access Required</h1>
          <p className="mb-8 text-gray-600">
            Please sign in with an authorized Google account to access the admin dashboard.
          </p>
          <button
            onClick={() => signIn('google')}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const handleBanUser = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    if (!confirm(`Change status to ${newStatus}?`)) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

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
                  <th className="px-6 py-3">Status</th>
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
                      <span className={`px-2 py-1 rounded text-xs ${user.status === 'BANNED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div>Photos: {user._count?.photos || 0}</div>
                        <div>Likes: {user._count?.sentLikes || 0}</div>
                        <div className="text-red-600 font-bold">Reports: {user._count?.reportsReceived || 0}</div>
                        <div>Blocks: {user._count?.blocksReceived || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button 
                        onClick={() => handleBanUser(user.id, user.status || 'ACTIVE')}
                        className={`text-sm font-medium ${user.status === 'BANNED' ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                      >
                        {user.status === 'BANNED' ? 'Unban' : 'Ban'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900"
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

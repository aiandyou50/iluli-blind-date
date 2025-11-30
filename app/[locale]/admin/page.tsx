'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'reports'>('verification');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/'); 
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedUser || !verificationCode) return;
    
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, code: verificationCode })
      });
      
      if (res.ok) {
        alert('Verified successfully');
        setSelectedUser(null);
        setVerificationCode('');
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Verification failed');
      }
    } catch (e) {
      alert('Error verifying');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const allUsers = users;

  if (status === 'loading' || loading) return <div className='p-8'>Loading...</div>;

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <h1 className='text-2xl font-bold mb-6'>Admin Dashboard</h1>
      
      <div className='flex gap-4 mb-6'>
        <button 
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded ${activeTab === 'verification' ? 'bg-pink-500 text-white' : 'bg-white'}`}
        >
          Verification Queue ({pendingUsers.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-pink-500 text-white' : 'bg-white'}`}
        >
          All Users
        </button>
      </div>

      {activeTab === 'verification' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {pendingUsers.map(user => (
            <div key={user.id} className='bg-white p-4 rounded shadow'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-16 h-16 bg-gray-200 rounded-full overflow-hidden relative'>
                  {user.photos?.[0]?.url ? (
                     <Image src={user.photos[0].url} alt={user.nickname} fill className='object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400'>No Img</div>
                  )}
                </div>
                <div>
                  <h3 className='font-bold'>{user.nickname}</h3>
                  <p className='text-sm text-gray-500'>{user.school}</p>
                  <p className='text-xs text-gray-400'>Code: {user.verificationCode}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedUser(user)}
                className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'
              >
                [인스타 확인]
              </button>
            </div>
          ))}
          {pendingUsers.length === 0 && <p>No pending users.</p>}
        </div>
      )}

      {activeTab === 'users' && (
        <div className='bg-white rounded shadow overflow-x-auto'>
            <table className='w-full'>
                <thead>
                    <tr className='bg-gray-100 text-left'>
                        <th className='p-3'>Nickname</th>
                        <th className='p-3'>Status</th>
                        <th className='p-3'>Last Active</th>
                        <th className='p-3'>Insta</th>
                    </tr>
                </thead>
                <tbody>
                    {allUsers.map(user => (
                        <tr key={user.id} className='border-t'>
                            <td className='p-3'>{user.nickname}</td>
                            <td className='p-3'>
                                <span className={px-2 py-1 rounded text-xs }>
                                    {user.status}
                                </span>
                            </td>
                            <td className='p-3'>{new Date(user.lastActiveAt).toLocaleDateString()}</td>
                            <td className='p-3'>{user.instagramId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {selectedUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-96'>
            <h3 className='text-lg font-bold mb-2'>인증 코드 확인</h3>
            <p className='mb-4'>유저: {selectedUser.nickname}</p>
            
            <input 
              type='text' 
              placeholder='6자리 코드 입력' 
              className='w-full p-2 border rounded mb-4'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            
            <button 
              onClick={handleVerify} 
              className='w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 mb-4'
            >
              코드 확인
            </button>
            
            <a 
              href={instagram://user?username=}
              target='_blank'
              rel='noopener noreferrer'
              className='block text-center text-blue-500 hover:underline'
            >
              [인스타그램으로 이동]
            </a>
            
            <button 
              onClick={() => { setSelectedUser(null); setVerificationCode(''); }}
              className='block w-full text-center text-gray-500 mt-4 text-sm hover:underline'
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

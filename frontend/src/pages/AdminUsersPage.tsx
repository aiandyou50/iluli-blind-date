import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/env';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  nickname: string | null;
  school: string | null;
  mbti: string | null;
  photo_count: number;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users?page=${page}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUsers(response.data.users);
      setHasMore(!!response.data.next_page);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError('사용자 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [idToken, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    if (!confirm('이 사용자를 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) return;

    setProcessingId(userId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUsers(users.filter((u) => u.id !== userId));
      alert('사용자가 삭제되었습니다.');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert('자기 자신은 삭제할 수 없습니다.');
      } else {
        alert('사용자 삭제에 실패했습니다.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`이 사용자의 역할을 "${newRole}"로 변경하시겠습니까?`)) return;

    setProcessingId(userId);
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      alert('역할이 변경되었습니다.');
    } catch (error) {
      alert('역할 변경에 실패했습니다.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    if (!confirm(`${inviteEmail} 계정을 관리자 권한으로 승급시키시겠습니까?`)) return;

    setInviteLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/invite`,
        { email: inviteEmail.trim() },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      alert('관리자 초대(승급)가 완료되었습니다.');
      setInviteEmail('');
      fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        alert(`오류: ${error.response.data.error}`);
      } else {
        alert('관리자 초대에 실패했습니다.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-sm text-gray-600">계정 조회, 삭제 및 권한 관리</p>
        </div>

        {/* Invite admin */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-2 items-center">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="관리자로 초대할 이메일 입력"
            className="px-4 py-2 border rounded-lg w-full"
          />
          <button
            onClick={handleInviteAdmin}
            disabled={inviteLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {inviteLoading ? '초대 중...' : '관리자 초대'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-xl">로딩 중...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">사용자가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      학교
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MBTI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사진
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nickname || '미설정'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.school || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.mbti || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.photo_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role === 'admin' ? '관리자' : '사용자'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={processingId === user.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {user.role === 'admin' ? '일반으로' : '관리자로'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={processingId === user.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2 bg-white rounded-lg shadow">
                페이지 {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </>
        )}

        <div className="mt-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/config/env';

interface Stats {
  total_users: number;
  total_photos: number;
  pending_photos: number;
  approved_photos: number;
  total_matches: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setStats(response.data.stats);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError('통계를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="mt-2 text-sm text-gray-600">이루리 소개팅 서비스 관리</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">전체 사용자</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.total_users || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">전체 사진</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stats?.total_photos || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">인증 대기</h3>
            <p className="mt-2 text-3xl font-semibold text-orange-600">
              {stats?.pending_photos || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">인증 완료</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {stats?.approved_photos || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">전체 매칭</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {stats?.total_matches || 0}
            </p>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin/photos')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">사진 관리</h3>
                <p className="mt-2 text-sm text-gray-600">
                  사진 목록 조회 및 삭제
                </p>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/verification')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">인증 관리</h3>
                <p className="mt-2 text-sm text-gray-600">
                  파트너 포토부스 사진 인증
                </p>
                {stats && stats.pending_photos > 0 && (
                  <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">
                    {stats.pending_photos}개 대기 중
                  </span>
                )}
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
                <p className="mt-2 text-sm text-gray-600">
                  계정 조회, 삭제 및 권한 관리
                </p>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* 뒤로 가기 버튼 */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/feed')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 메인 피드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('googleIdToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MatchingCard {
  user_id: string;
  nickname: string;
  school?: string;
  mbti?: string;
  bio?: string;
  instagram_url?: string | null;
  photos: {
    id: string;
    image_url: string;
  }[];
}

export interface MatchingDeckResponse {
  deck: MatchingCard[];
}

export interface MatchData {
  match_id: string;
  matched_user: {
    user_id: string;
    nickname: string;
    instagram_url: string | null;
  };
}

export interface MatchingActionResponse {
  message: string;
  matched: boolean;
  match: MatchData | null;
}

export interface Match {
  match_id: string;
  matched_at: string;
  matched_user: {
    user_id: string;
    nickname: string;
    instagram_url: string | null;
  };
}

export interface MatchesResponse {
  matches: Match[];
}

/**
 * 매칭 카드 덱 조회
 */
export async function getMatchingDeck(): Promise<MatchingDeckResponse> {
  const response = await api.get<MatchingDeckResponse>('/matching/deck');
  return response.data;
}

/**
 * 매칭 액션 (OK/Pass)
 */
export async function performMatchingAction(
  targetUserId: string,
  action: 'ok' | 'pass'
): Promise<MatchingActionResponse> {
  const response = await api.post<MatchingActionResponse>('/matching/action', {
    target_user_id: targetUserId,
    action,
  });
  return response.data;
}

/**
 * 내 매칭 목록 조회
 */
export async function getMyMatches(): Promise<MatchesResponse> {
  const response = await api.get<MatchesResponse>('/matching/matches');
  return response.data;
}

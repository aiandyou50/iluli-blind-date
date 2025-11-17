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

export interface FeedPhoto {
  photo_id: string;
  image_url: string;
  user: {
    user_id: string;
    nickname: string;
  };
  likes_count: number;
  i_like_this: boolean;
  // verification status from the backend for the photo
  verification_status: 'not_applied' | 'pending' | 'approved' | 'rejected';
}

export interface FeedResponse {
  feed: FeedPhoto[];
  next_page: number | null;
}

export interface Liker {
  user_id: string;
  nickname: string;
  liked_at: string;
}

export interface LikersResponse {
  likers: Liker[];
  total_count: number;
}

/**
 * 피드 조회
 */
export async function getFeed(params: {
  sort?: 'latest' | 'oldest' | 'popular' | 'random' | 'distance';
  page?: number;
  lat?: number;
  lon?: number;
}): Promise<FeedResponse> {
  const response = await api.get<FeedResponse>('/feed', { params });
  return response.data;
}

/**
 * 사진에 좋아요 누르기
 */
export async function likePhoto(photoId: string): Promise<void> {
  await api.post(`/photos/${photoId}/like`);
}

/**
 * 좋아요 취소
 */
export async function unlikePhoto(photoId: string): Promise<void> {
  await api.post(`/photos/${photoId}/unlike`);
}

/**
 * 좋아요 누른 사람 목록 조회
 */
export async function getPhotoLikers(photoId: string): Promise<LikersResponse> {
  const response = await api.get<LikersResponse>(`/photos/${photoId}/likers`);
  return response.data;
}

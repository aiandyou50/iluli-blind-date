// 사용자 프로필 타입
export interface UserProfile {
  user_id: string;
  email: string;
  nickname: string | null;
  school: string | null;
  mbti: string | null;
  bio: string | null;
  instagram_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
}

// 프로필 사진 타입
export interface ProfilePhoto {
  id: string;
  image_url: string;
  verification_status: 'not_applied' | 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  likes_count: number;
}

// 프로필 업데이트 요청
export interface ProfileUpdateRequest {
  nickname?: string;
  school?: string;
  mbti?: string;
  bio?: string;
  instagram_url?: string | null;
  latitude?: number;
  longitude?: number;
}

// API 응답 타입
export interface ProfileResponse {
  profile: UserProfile;
  photos: ProfilePhoto[];
}

export interface PhotoUploadResponse {
  photo: ProfilePhoto;
}

export interface ApiError {
  error: string;
}

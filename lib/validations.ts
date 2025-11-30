import { z } from 'zod';

export const reportSchema = z.object({
  targetUserId: z.string().cuid(),
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional()
});

export const blockSchema = z.object({
  targetUserId: z.string().cuid()
});

export const matchActionSchema = z.object({
  targetUserId: z.string().cuid().optional(),
  photoId: z.string().cuid().optional(),
  action: z.enum(['like', 'pass'])
}).refine(data => data.targetUserId || data.photoId, {
  message: "Either targetUserId or photoId is required"
});

// [EN] Supported image formats: jpeg (jpg), png, webp, avif, heic, heif, jxl
// [KR] 지원되는 이미지 형식: jpeg (jpg), png, webp, avif, heic, heif, jxl
export const uploadPresignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|heic|heif|avif|jxl)$/, "Invalid image type")
});

export const adminUserUpdateSchema = z.object({
  userId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'BANNED'])
});

export const profileSchema = z.object({
  nickname: z.string()
    .regex(/^[가-힣a-zA-Z0-9]{1,15}$/, "Nickname must be 1-15 characters, no special characters"),
  school: z.string()
    .regex(/^[가-힣a-zA-Z0-9]{2,15}$/, "School name must be 2-15 characters, no special characters"),
  instagramId: z.string()
    .regex(/^[a-zA-Z0-9._]{1,30}$/, "Instagram ID must be 1-30 characters, alphanumeric, dot or underscore"),
  introduction: z.string().max(300, "Introduction must be 300 characters or less").optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  isGraduated: z.boolean().default(false),
});

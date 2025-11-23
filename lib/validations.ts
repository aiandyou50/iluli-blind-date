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

export const uploadPresignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|gif|webp|heic)$/, "Invalid image type")
});

export const adminUserUpdateSchema = z.object({
  userId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'BANNED'])
});

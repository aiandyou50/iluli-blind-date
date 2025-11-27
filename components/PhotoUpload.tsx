'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface PhotoUploadProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function PhotoUpload({ userId, onUploadSuccess }: PhotoUploadProps) {
  const t = useTranslations('profile');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [EN] Handle file selection and upload to R2 storage + database
  // [KR] 파일 선택 및 R2 스토리지 + 데이터베이스 업로드 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // [EN] Client-side validation: Check if file size exceeds 10MB
    // [KR] 클라이언트 측 검증: 파일 크기가 10MB를 초과하는지 확인
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get Presigned URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        }),
      });

      if (!presignRes.ok) {
        console.error('Failed to get presigned URL:', await presignRes.text());
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await presignRes.json() as { uploadUrl: string; fileUrl: string };

      // 2. Upload to R2 directly
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file,
      });

      if (!uploadRes.ok) {
        console.error('Direct upload failed:', await uploadRes.text());
        throw new Error('Upload failed');
      }

      // 3. Save metadata to DB
      const saveRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fileUrl,
          userId: userId,
        }),
      });

      if (!saveRes.ok) {
        // [EN] Log database save failure for debugging
        // [KR] 디버깅을 위한 데이터베이스 저장 실패 로그
        console.error('Failed to save photo metadata:', await saveRes.text());
        throw new Error('Failed to save photo info');
      }

      onUploadSuccess();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      // [EN] Log error to console for debugging
      // [KR] 디버깅을 위한 에러 로그
      console.error('Photo upload error:', error);
      alert(t('error') || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,image/avif,image/jxl"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isUploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {t('addPhoto')}
          </>
        )}
      </button>
    </div>
  );
}

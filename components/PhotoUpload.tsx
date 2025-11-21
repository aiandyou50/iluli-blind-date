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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Upload to R2
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      const { fileUrl } = await uploadRes.json();

      // 2. Save metadata to DB
      const saveRes = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fileUrl,
          userId: userId,
        }),
      });

      if (!saveRes.ok) throw new Error('Failed to save photo info');

      onUploadSuccess();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      alert(t('error') || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        accept="image/*"
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

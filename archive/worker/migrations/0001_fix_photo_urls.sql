-- Migration to update photo URLs from R2.dev to worker-served URLs
-- This fixes the image loading issue for existing photos

-- For production: Replace iluli-photos.r2.dev with aiboop.org/images
UPDATE ProfilePhotos
SET image_url = REPLACE(image_url, 'https://iluli-photos.r2.dev/', 'https://aiboop.org/images/')
WHERE image_url LIKE 'https://iluli-photos.r2.dev/%';

-- For development/local: Replace iluli-photos.r2.dev with localhost:8787/images
-- Uncomment the following line for local development:
-- UPDATE ProfilePhotos
-- SET image_url = REPLACE(image_url, 'https://iluli-photos.r2.dev/', 'http://localhost:8787/images/')
-- WHERE image_url LIKE 'https://iluli-photos.r2.dev/%';

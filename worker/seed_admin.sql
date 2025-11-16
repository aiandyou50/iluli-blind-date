-- Seed script to set admin role for specific users
-- Date: 2025-11-16
-- Purpose: Initialize admin users for the Iluli blind date service

-- Set sungyo0518@gmail.com as admin
-- Note: This assumes the user has already logged in at least once
UPDATE Users
SET role = 'admin'
WHERE email = 'sungyo0518@gmail.com';

-- Verify the update
SELECT id, email, role, created_at
FROM Users
WHERE email = 'sungyo0518@gmail.com';

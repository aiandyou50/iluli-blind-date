# Testing Guide for Admin Access Control and Photo Features

This document describes how to test the newly implemented features.

## Features Implemented

1. **Admin Dashboard Access Control (Protected Routing)**
2. **Admin Database Setup and Documentation**
3. **Profile Photo Modal Implementation**
4. **Profile Photo Thumbnail Bug Fix**

---

## 1. Testing Admin Dashboard Access Control

### Prerequisites
- User must be logged in via Google OAuth
- User must have admin role in the database

### Test Cases

#### Test Case 1.1: Non-authenticated user accessing /admin
1. Log out if currently logged in
2. Navigate to `http://localhost:5173/admin`
3. **Expected Result**: User should be redirected to `/` (login page)

#### Test Case 1.2: Authenticated non-admin user accessing /admin
1. Log in with a regular (non-admin) user account
2. Navigate to `http://localhost:5173/admin`
3. **Expected Result**: 
   - Loading message appears briefly: "권한 확인 중..."
   - User is redirected to `/` (main page)

#### Test Case 1.3: Authenticated admin user accessing /admin
1. Set a user as admin using the seed script:
   ```bash
   cd worker
   wrangler d1 execute iluli-db --local --file=./seed_admin.sql
   ```
2. Log in with the admin user (sungyo0518@gmail.com)
3. Navigate to `http://localhost:5173/admin`
4. **Expected Result**: 
   - Loading message appears briefly: "권한 확인 중..."
   - Admin dashboard loads successfully
   - User can see statistics and navigation cards

#### Test Case 1.4: Admin accessing all admin routes
Test these routes with an admin user:
- `/admin` - Dashboard
- `/admin/verification` - Photo verification
- `/admin/photos` - Photo management
- `/admin/users` - User management

**Expected Result**: All pages should load successfully

---

## 2. Testing Admin Database Setup

### Setting Admin Role

#### Method 1: Using seed script
```bash
cd worker
# Local environment
wrangler d1 execute iluli-db --local --file=./seed_admin.sql

# Production environment
wrangler d1 execute iluli-db --remote --file=./seed_admin.sql
```

#### Method 2: Direct SQL command
```bash
# Set admin role
wrangler d1 execute iluli-db --local --command="UPDATE Users SET role = 'admin' WHERE email = 'user@example.com';"

# Verify the change
wrangler d1 execute iluli-db --local --command="SELECT id, email, role FROM Users WHERE email = 'user@example.com';"
```

### Test Case 2.1: Verify admin guide documentation
1. Open `docs/admin_guide.md`
2. Verify it contains:
   - Clear instructions for adding new admins
   - SQL query examples
   - Both local and production environment instructions
   - Safety warnings and best practices

---

## 3. Testing Profile Photo Modal

### Prerequisites
- User must be logged in
- User should have at least one photo uploaded to their profile

### Test Cases

#### Test Case 3.1: Opening photo modal
1. Navigate to `/profile`
2. Click on any photo thumbnail
3. **Expected Result**:
   - Modal opens with enlarged photo
   - Modal shows photo details (like count, verification status)
   - Modal shows action buttons (Delete, Festival verification if applicable)

#### Test Case 3.2: Viewing photo details in modal
1. Open a photo modal
2. **Expected Result**:
   - Photo is displayed at full size
   - Like count is shown with heart icon
   - Verification status is displayed:
     - ✅ 인증 승인됨 (approved)
     - ⏳ 인증 대기중 (pending)
     - ❌ 인증 거절됨 (rejected)
     - 🔒 인증 미신청 (not_applied)
   - If rejected, rejection reason is shown in a red box

#### Test Case 3.3: Delete button functionality
1. Open a photo modal
2. Click the "삭제" (Delete) button
3. **Expected Result**:
   - Confirmation dialog appears
   - If confirmed, photo is deleted from the database
   - Modal closes
   - Photo list refreshes and deleted photo is gone

#### Test Case 3.4: Festival verification button
1. Open a modal for a photo with `not_applied` status
2. **Expected Result**:
   - "학교축제 인증하기" button is visible
3. Click the button
4. **Expected Result**:
   - Verification request is submitted
   - Modal closes
   - Photo status changes to `pending`

#### Test Case 3.5: Closing modal
1. Open a photo modal
2. Try these methods to close:
   - Click the X button in top-right corner
   - Click outside the modal (on the dark background)
   - Press ESC key
3. **Expected Result**: Modal closes in all cases

---

## 4. Testing Profile Photo Thumbnail Display

### Test Cases

#### Test Case 4.1: Photos display correctly
1. Navigate to `/profile`
2. Upload a photo if none exist
3. **Expected Result**:
   - Photos are displayed in a grid (2 columns on mobile, 3 on desktop)
   - Each photo shows:
     - Thumbnail image (h-48, object-cover)
     - Like count badge (if likes > 0)
     - Hover overlay with verification status
     - "자세히 보기" button on hover

#### Test Case 4.2: Cursor indicates clickability
1. Navigate to `/profile`
2. Hover over a photo thumbnail
3. **Expected Result**: Cursor changes to pointer, indicating the photo is clickable

#### Test Case 4.3: Image load error handling
1. Manually test with an invalid image URL (requires modifying data)
2. **Expected Result**:
   - Error is logged to console
   - Placeholder image is shown with "이미지 로드 실패" text

#### Test Case 4.4: Click to open modal
1. Click on a photo thumbnail
2. **Expected Result**: 
   - Photo modal opens
   - Correct photo is displayed in the modal

---

## Running the Application

### Start Backend (Worker)
```bash
cd worker
npm run dev
# Runs on http://localhost:8787
```

### Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Build Frontend
```bash
cd frontend
npm run build
# Creates production build in dist/
```

---

## Common Issues and Solutions

### Issue: "권한 확인 중..." appears forever
**Solution**: Check that the backend is running and the API endpoint `/admin/stats` is accessible.

### Issue: Modal doesn't open when clicking photos
**Solution**: 
1. Check browser console for errors
2. Verify Headless UI is properly installed
3. Check that PhotoModal component is imported correctly

### Issue: Photos don't display
**Solution**:
1. Check that photos array is populated (use React DevTools)
2. Verify image URLs are correct
3. Check browser console for image load errors
4. Verify CORS settings if images are from external source

### Issue: Admin redirect not working
**Solution**:
1. Verify user has `role = 'admin'` in database
2. Check that idToken is set in authStore
3. Verify admin API endpoint returns 200 status
4. Check browser console for network errors

---

## Security Notes

1. Admin check is performed on every admin route access
2. Backend validates admin role via JWT token
3. Non-admin users cannot bypass frontend protection as backend also validates
4. All admin API endpoints require both authentication and admin role

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-16

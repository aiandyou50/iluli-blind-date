# Admin Interface Features

## Overview
This document describes the admin interface pages and their features.

## Pages

### 1. Admin Dashboard (`/admin`)

**Features:**
- Statistics Overview
  - Total Users count
  - Total Photos count
  - Pending Verifications count (orange badge)
  - Approved Photos count (green badge)
  - Total Matches count (blue badge)
- Quick Access Cards
  - Photo Management card with camera icon
  - Verification Management card with checkmark icon (shows pending count badge)
  - User Management card with users icon

**Actions:**
- Click cards to navigate to respective management pages
- Return to feed via back button

---

### 2. Photo Management (`/admin/photos`)

**Features:**
- Filter buttons for verification status:
  - All (default)
  - Not Applied
  - Pending
  - Approved
  - Rejected
- Photo grid display showing:
  - Photo thumbnail
  - Verification status badge (color-coded)
  - Likes count (❤️)
  - User nickname and email
  - Rejection reason (if rejected, in red box)
  - Upload date/time
- Pagination controls (Previous/Next page)

**Actions:**
- Delete photo button (red)
- Filter by status
- Navigate between pages

---

### 3. Verification Management (`/admin/verification`)

**Features:**
- Grid of pending verification photos
- Each card shows:
  - Full photo preview
  - User nickname
  - User email
  - Submission timestamp
- Two action buttons per photo:
  - Approve (green button)
  - Reject (red button)
- Empty state message if no pending photos

**Actions:**
- Approve photo - sets status to 'approved'
- Reject photo - prompts for reason, sets status to 'rejected'
- Auto-refreshes after approve/reject

---

### 4. User Management (`/admin/users`)

**Features:**
- Table view with columns:
  - User (nickname)
  - Email
  - School
  - MBTI
  - Photo count
  - Role (badge: purple for admin, gray for user)
  - Join date
  - Actions
- Pagination controls

**Actions per user:**
- Toggle role - Convert user ↔ admin
- Delete user - Permanently remove (cannot delete self)
- Pagination to browse users

---

## Color Coding

**Verification Status Badges:**
- Gray: Not Applied
- Orange: Pending
- Green: Approved
- Red: Rejected

**Role Badges:**
- Purple: Admin
- Gray: Regular User

**Statistics Cards:**
- Orange number: Pending items (action required)
- Green number: Approved items
- Blue number: Matches
- Black number: General stats

---

## API Endpoints Used

All endpoints are under `/api/v1/admin/` and require admin authentication.

**Statistics:**
- GET /stats

**Photos:**
- GET /photos (with optional ?status= filter)
- GET /photos/pending
- POST /photos/:photoId/approve
- POST /photos/:photoId/reject (body: { reason })
- DELETE /photos/:photoId

**Users:**
- GET /users
- GET /users/:userId
- PATCH /users/:userId/role (body: { role: 'user' | 'admin' })
- DELETE /users/:userId

---

## Security

- All pages require authentication (Google OAuth)
- All pages check for admin role
- Non-admin users receive 403 Forbidden error
- Admin cannot delete themselves
- Deletion cascades properly (user deletion removes all photos, likes, etc.)

---

## Navigation Flow

```
Login → Feed → /admin (direct URL) → Dashboard
                                    ├─→ Photos
                                    ├─→ Verification
                                    └─→ Users
                                    
Each admin page has "← Back to Dashboard" button
Dashboard has "← Back to Feed" button
```

---

## Responsive Design

- All pages are responsive using Tailwind CSS
- Grid layouts adjust for mobile/tablet/desktop
- Tables become scrollable on small screens
- Touch-friendly buttons and controls

---

## User Experience

**Loading States:**
- "로딩 중..." message while fetching data

**Empty States:**
- Meaningful messages when no data exists
- Example: "인증 대기 중인 사진이 없습니다."

**Error Handling:**
- 403 errors show "관리자 권한이 필요합니다."
- General errors show descriptive messages
- Alerts for action confirmations

**Confirmations:**
- Delete actions require confirmation
- Role changes require confirmation
- Rejection allows optional reason input

---

## Notes for Developers

1. Frontend pages use React with TypeScript
2. State management via React hooks (useState, useEffect)
3. API calls via Axios
4. Authentication token from Zustand store
5. Tailwind CSS for styling
6. Heroicons for SVG icons

## Notes for Users

1. Access admin panel by navigating to `/admin` URL
2. Only accounts with admin role can access
3. Contact system administrator to get admin role
4. All actions are permanent (deletions cannot be undone)
5. Approving photos adds partner photobooth badge
6. Rejecting photos keeps them in feed but marks as rejected

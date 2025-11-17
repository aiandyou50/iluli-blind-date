# Deployment Guide - Applying Bug Fixes

This guide helps you deploy the bug fixes to your production environment.

## Prerequisites

- Wrangler CLI installed and authenticated
- Access to Cloudflare dashboard
- Git repository access

## Step 1: Deploy Code Changes

### Frontend Deployment

```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/`. Deploy these to your Cloudflare Pages or hosting service.

### Worker Deployment

```bash
cd worker
npm install
wrangler deploy --env production
```

This will deploy the updated Worker code with the auth and R2 fixes.

## Step 2: Run Database Migration (CRITICAL)

This migration fixes existing photo URLs that are causing 500 errors.

```bash
cd worker
wrangler d1 execute iluli-db --remote --file=./migrations/0001_fix_photo_urls.sql
```

**What this does:**
- Updates all photo URLs from `https://iluli-photos.r2.dev/...` to `https://aiboop.org/images/...`
- Fixes the 500 errors when loading images
- Required for existing photos to display correctly

**Verification:**
After running the migration, check your database:
```bash
wrangler d1 execute iluli-db --remote --command "SELECT image_url FROM ProfilePhotos LIMIT 5;"
```

URLs should start with `https://aiboop.org/images/` not `https://iluli-photos.r2.dev/`

## Step 3: Verify Deployment

### Test Feed Functionality
1. Log in to your application
2. Navigate to the feed page
3. You should now see photos (previously showed 401 errors)
4. Upload a new photo from your profile
5. Navigate to feed - your photo should NOT appear (correct - you don't see your own photos)
6. Ask another user to check feed - they SHOULD see your photo

### Test Image Loading
1. Go to your profile page
2. Images should load correctly (no 500 errors)
3. Try uploading a new photo
4. Upload progress bar should appear
5. New photo should save and display correctly

### Test Admin Features (if you're an admin)
1. Go to admin verification page
2. Select multiple pending photos
3. Click "Bulk Approve"
4. All selected photos should be approved at once

## Troubleshooting

### Feed Still Shows 401 Errors
**Problem**: Auth tokens not being stored correctly
**Solution**: 
1. Clear browser localStorage
2. Log out and log back in
3. Check browser console for errors

### Images Still Show 500 Errors
**Problem**: Migration not run or failed
**Solution**:
1. Verify migration ran successfully: `wrangler d1 execute iluli-db --remote --command "SELECT COUNT(*) FROM ProfilePhotos WHERE image_url LIKE '%r2.dev%';"`
2. Should return 0. If not, re-run migration
3. Check Worker logs: `wrangler tail --env production`

### Photos Not Appearing After Upload
**Problem**: Might be authentication or Worker routing issue
**Solution**:
1. Check Worker deployment: `wrangler deployments list`
2. Verify auth token in browser localStorage under key 'iluli-auth'
3. Check network tab in browser dev tools for API responses

## What Was Fixed

✅ **Feed API 401 Errors** - Auth tokens now sent correctly
✅ **Image Loading 500 Errors** - R2 images now served through Worker
✅ **R2 Deletion** - Works with both old and new URL formats
✅ **Bulk Approval** - Already implemented, just verify it works
✅ **Upload Progress** - Already implemented, just verify it works

## What Remains (Optional)

The UI/UX rebuild (Issues #8-9) is a separate major project:
- Requires rewriting all frontend components
- New design system (colors, fonts, layouts)
- Estimated 1 week of work
- Recommend creating a separate task for this

## Support

If you encounter issues after deployment:
1. Check Worker logs: `wrangler tail --env production`
2. Check browser console for JavaScript errors
3. Verify migration ran successfully
4. Check D1 database data directly using Cloudflare dashboard

## Rollback (if needed)

If something goes wrong:
```bash
# List previous deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

Note: Database migrations cannot be easily rolled back. Back up your database before running migrations if possible.

# Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying all changes to fix the 6 reported issues.

## Prerequisites
- Wrangler CLI installed and configured
- Access to Cloudflare Workers and D1 database
- Node.js and npm installed

## Deployment Steps

### 1. Deploy Backend (Worker)

```bash
cd worker
npm install
npm run deploy
```

This will deploy the updated worker with:
- New `/images` route for serving R2 images
- Updated photo upload logic

### 2. Run Database Migration

**IMPORTANT:** This step is required to fix existing photos in the database.

#### For Production:
```bash
cd worker
wrangler d1 execute iluli-db --remote --file=./migrations/0001_fix_photo_urls.sql
```

#### For Local Development:
1. Edit `worker/migrations/0001_fix_photo_urls.sql`
2. Uncomment the local development section
3. Run:
```bash
wrangler d1 execute iluli-db --local --file=./migrations/0001_fix_photo_urls.sql
```

**Verify Migration:**
```bash
# Check that URLs were updated
wrangler d1 execute iluli-db --remote --command="SELECT image_url FROM ProfilePhotos LIMIT 5"
```

Expected result: URLs should start with `https://aiboop.org/images/` instead of `https://iluli-photos.r2.dev/`

### 3. Deploy Frontend

```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/` and should be deployed to your hosting platform.

#### If using Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name=iluli-frontend
```

### 4. Verification Checklist

After deployment, test the following:

#### UI Changes:
- [ ] Navigate to admin error page - should NOT show `sungyo0518@gmail.com`
- [ ] Navigate to login page - should NOT show privacy notice
- [ ] Admin verification page shows bulk approval controls
- [ ] Photo upload shows progress bar (0-100%)

#### Image Serving:
- [ ] Upload a new photo
- [ ] Photo displays correctly (no 500 error)
- [ ] Check network tab: image URL should be `https://aiboop.org/images/...`

#### Feed:
- [ ] New photos appear in feed immediately
- [ ] Approved photos show verification badge "학교 축제 인증"
- [ ] Old photos (after migration) display correctly

#### Admin Features:
- [ ] Bulk select photos in verification page
- [ ] Approve multiple photos at once
- [ ] Success message appears

### 5. Rollback Plan

If issues occur:

#### Rollback Backend:
```bash
cd worker
git revert HEAD
npm run deploy
```

#### Rollback Database (if needed):
```bash
# Restore old URLs
wrangler d1 execute iluli-db --remote --command="UPDATE ProfilePhotos SET image_url = REPLACE(image_url, 'https://aiboop.org/images/', 'https://iluli-photos.r2.dev/') WHERE image_url LIKE 'https://aiboop.org/images/%'"
```

## Post-Deployment

### Monitor for Issues

Check the following for 24 hours after deployment:

1. **Error Logs:**
```bash
wrangler tail --production
```

2. **Image Loading:**
   - Check browser console for 500 errors
   - Monitor R2 bucket access logs

3. **User Reports:**
   - Photo upload failures
   - Images not appearing
   - Feed not loading

### Performance Monitoring

- Image load times should improve (caching enabled)
- First photo load: ~500ms
- Cached photos: <50ms

## Troubleshooting

### Images Still Not Loading

**Symptom:** 500 errors when loading images

**Solution:**
1. Check migration was successful:
```bash
wrangler d1 execute iluli-db --remote --command="SELECT COUNT(*) FROM ProfilePhotos WHERE image_url LIKE 'https://iluli-photos.r2.dev/%'"
```

Should return 0.

2. Verify R2 bucket exists and has data:
```bash
wrangler r2 object list iluli-photos --limit 5
```

### Bulk Approval Not Working

**Symptom:** Clicking bulk approve doesn't work

**Solution:**
1. Check browser console for JavaScript errors
2. Verify admin authentication token is valid
3. Check network tab for failed API calls

### Upload Progress Bar Not Showing

**Symptom:** No progress bar during upload

**Solution:**
1. Hard refresh browser (Ctrl+F5)
2. Clear browser cache
3. Check that new frontend code is deployed

## Environment Variables

Ensure these are set correctly:

### Worker (wrangler.toml):
- `ALLOWED_ORIGIN` = `https://aiboop.org` (production)
- `GOOGLE_CLIENT_ID` = Your Google OAuth client ID

### Frontend (.env.production):
- `VITE_API_BASE_URL` = `https://aiboop.org/api/v1`
- `VITE_GOOGLE_CLIENT_ID` = Your Google OAuth client ID

## Support

If deployment issues persist:

1. Check Cloudflare dashboard for worker errors
2. Review D1 database query logs
3. Inspect R2 bucket permissions
4. Contact the development team with:
   - Error messages
   - Browser console logs
   - Network request/response details

## Next Steps

After successful deployment:

1. Monitor application for 24-48 hours
2. Collect user feedback
3. Consider implementing suggested improvements (see IMPLEMENTATION_SUMMARY_FINAL.md)

---

**Deployment Complete!** 🚀

All 6 issues should now be resolved. Users can upload photos with progress feedback, admins can bulk approve, and all images should load correctly.

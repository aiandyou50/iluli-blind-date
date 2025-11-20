# Database Migration: Fix Photo URLs

## Problem
Photos were using direct R2.dev URLs which don't work due to CORS and authentication issues.

## Solution
Update all photo URLs to use the worker-served endpoint `/images/:userId/:photoId`.

## How to Apply

### For Production
```bash
wrangler d1 execute iluli-db --remote --file=./migrations/0001_fix_photo_urls.sql
```

### For Local Development
1. Uncomment the local development line in the migration file
2. Run:
```bash
wrangler d1 execute iluli-db --local --file=./migrations/0001_fix_photo_urls.sql
```

## Verification
After running the migration, verify that image URLs in the database start with:
- Production: `https://aiboop.org/images/`
- Local: `http://localhost:8787/images/`

Instead of: `https://iluli-photos.r2.dev/`

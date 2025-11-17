import { Hono } from 'hono';
import { Env } from '../types/env';

const images = new Hono<{ Bindings: Env }>();

/**
 * GET /images/:userId/:photoId
 * Serve images from R2 bucket
 * This route provides public access to uploaded photos
 */
images.get('/:userId/:photoId', async (c) => {
  const userId = c.req.param('userId');
  const photoId = c.req.param('photoId');
  
  // Construct R2 key
  const r2Key = `${userId}/${photoId}`;
  
  try {
    // Get object from R2
    const object = await c.env.R2.get(r2Key);
    
    if (!object) {
      return c.notFound();
    }
    
    // Return the image with proper headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    
    // Enable CORS for images
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Error serving image from R2:', error);
    return c.json({ error: 'Failed to retrieve image' }, 500);
  }
});

export default images;

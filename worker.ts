// (Imports and other functions remain the same)

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/auth/google' && request.method === 'POST') {
    return handleGoogleAuth(request, env);
  }

  const userMatch = path.match(/^\/api\/users\/([a-zA-Z0-9_-]+)$/);
  if (userMatch) {
    // ... (GET/PUT user profile logic remains the same)
  }

  if (path === '/api/likes' && request.method === 'POST') {
    return handleLike(request, env);
  }

  return new Response('API endpoint not found', { status: 404 });
}

async function handleLike(request: Request, env: Env): Promise<Response> {
  try {
    const { user_id_liker, user_id_liked } = await request.json();
    if (!user_id_liker || !user_id_liked) {
      return new Response('Liker and liked user IDs are required', { status: 400 });
    }

    // 1. Insert the new "like"
    await env.DB.prepare(
      'INSERT INTO likes (user_id_liker, user_id_liked) VALUES (?, ?)'
    ).bind(user_id_liker, user_id_liked).run();

    // 2. Check if the "liked" user has also liked the "liker" user (a mutual like)
    const mutualLike = await env.DB.prepare(
      'SELECT id FROM likes WHERE user_id_liker = ? AND user_id_liked = ?'
    ).bind(user_id_liked, user_id_liker).first();

    let matchCreated = false;
    if (mutualLike) {
      // 3. If a mutual like exists, create a match
      // To avoid duplicate matches (user1, user2) and (user2, user1), we store them in a consistent order
      const [user1, user2] = [user_id_liker, user_id_liked].sort();

      await env.DB.prepare(
        'INSERT OR IGNORE INTO matches (user_id_1, user_id_2) VALUES (?, ?)'
      ).bind(user1, user2).run();
      matchCreated = true;
    }

    return new Response(JSON.stringify({ success: true, matchCreated }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // Handle potential unique constraint violation if a "like" already exists
    if (error.message.includes('UNIQUE constraint failed')) {
      return new Response('Like already exists', { status: 409 });
    }
    return new Response(`Failed to process like: ${error.message}`, { status: 500 });
  }
}

// ... (Rest of the worker.ts code: getUserProfile, updateUserProfile, etc.)
// Note: Need to re-paste the full worker code for the tool to work correctly.

const MIGRATION_SQL = `...`; // SQL content
// ... full worker code from previous steps
export default { /* ... */ };
interface Env { /* ... */ }

// --- Ensure Cloudflare sees an event handler ---
// Export a module fetch handler so Wrangler/Cloudflare will register the worker.
// This delegates API requests to the existing handleApiRequest function.
export async function fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    // Route API requests to the API handler
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      return await handleApiRequest(request, env);
    }

    // For other routes, return 404 by default; adjust if you want to serve static files
    return new Response('Not Found', { status: 404 });
  } catch (err: any) {
    return new Response(`Worker error: ${err?.message ?? err}`, { status: 500 });
  }
}

// --- PASTE OF FULL WORKER.TS CODE FOR CONTEXT ---
// (The actual tool call will use the full, updated code)

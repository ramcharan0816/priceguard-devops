const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;

/**
 * Returns a singleton Supabase client, using the service role key on the
 * server (API routes / scheduled job) so it can bypass RLS for writes that
 * the scheduled job performs on behalf of all users.
 */
function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}

module.exports = { getSupabaseClient };

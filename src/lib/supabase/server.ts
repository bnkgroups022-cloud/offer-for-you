import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, built once per request from the SERVICE
 * ROLE key. Never import this file from a "use client" component — the
 * service role key bypasses Row Level Security entirely and must never
 * reach the browser bundle.
 *
 * The `projects` table has RLS enabled with zero policies (see the
 * README's "Supabase Setup" section), which means the anon/authenticated
 * roles can't touch it at all — only this service-role client can. That
 * is the app's actual access boundary, not Supabase Auth (which this
 * project doesn't use — Firebase handles sign-in, see the Security note
 * in src/app/api/projects/route.ts for what that does and doesn't mean).
 */
let cached: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase isn't configured on the server. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return cached;
}

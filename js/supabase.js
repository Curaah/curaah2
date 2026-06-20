// ═══════════════════════════════════════════════════════════════
// CURAAH 2.0 — SUPABASE CLIENT
// New, separate project from Curaah Hospital OS
// ═══════════════════════════════════════════════════════════════

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://odefkuavdrximrkcfnbd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_v8_0rizrl232lQEAPXyBfw_pyFD-2CE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─────────────────────────────────────────────
// IMPORTANT SECURITY NOTE
// ─────────────────────────────────────────────
// This anon key is PUBLIC and safe to expose in frontend code.
// Row Level Security (RLS) policies on every table protect data —
// a user can only ever read/write rows that belong to them.
//
// NEVER put LLM API keys (Sarvam, Claude, Gemini) in this file
// or anywhere in frontend code. All AI calls MUST go through
// Supabase Edge Functions, which hold the keys as server-side
// secrets. The frontend only ever calls:
//
//   supabase.functions.invoke('proxy-llm', { body: {...} })
//
// This keeps every AI provider key completely invisible to
// anyone inspecting the website's source code or network tab.
// ─────────────────────────────────────────────

/**
 * Get the current logged-in user's row from public.users.
 * Returns null if not logged in or profile not yet created.
 */
export async function getCurrentUserProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Require an authenticated session, or redirect to login.
 * Call this at the top of any page that needs a logged-in user.
 * Returns the session object if present.
 */
export async function requireAuth(redirectTo = 'login.html') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${redirectTo}?return=${returnUrl}`;
    return null;
  }
  return session;
}

/**
 * Sign out and clear session.
 */
export async function signOutUser() {
  await supabase.auth.signOut();
}

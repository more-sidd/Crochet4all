import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These come from a .env file (see README). If they're missing, the whole app
// still works — the blog just stores posts in this browser instead of a shared
// cloud database. Adding the two keys turns it into a real shared community.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

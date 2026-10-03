import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qfbwuriarypmzyrzapzx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_6nTJnfTbXKMprwZFA_n72A_HZ958iUL';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('YOUR_SUPABASE')
  );
};

// Create a singleton Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

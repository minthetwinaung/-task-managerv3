import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const isPlaceholderValue = value => {
  if (!value) return true;
  const placeholderPatterns = [
    'your-project-ref.supabase.co',
    'your-anon-public-api-key',
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
  ];
  return placeholderPatterns.some(pattern => value.includes(pattern));
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey &&
  !isPlaceholderValue(supabaseUrl) &&
  !isPlaceholderValue(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;


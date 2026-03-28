import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qfinablpaknitaytdgoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaW5hYmxwYWtuaXRheXRkZ29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU4NDQsImV4cCI6MjA5MDI4MTg0NH0.Dn5sssgkCcY88uy-9_f7H0DHQdPUYkBlgkUwU-7txaE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Deployment = {
  id: string;
  ticket_id: string;
  version: string;
  stage: 'develop' | 'testing' | 'uat';
  release_date: string;
  description: string;
  owner: string;
  status: 'active' | 'in-progress' | 'failed' | 'rolled-back';
  created_at: string;
  updated_at: string;
};

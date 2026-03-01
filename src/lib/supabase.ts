import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fynaockbihoigypzdint.supabase.co';
const supabaseAnonKey = 'sb_publishable_39tKJZccXJCW7qEDA4csiw_GstP1WbG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

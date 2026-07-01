import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqeojfoargipnkbtygix.supabase.co';
const supabaseKey = 'sb_publishable_6BgNHtak__Ycf_cXs96XYQ_7o6pNs4U';

export const supabase = createClient(supabaseUrl, supabaseKey);

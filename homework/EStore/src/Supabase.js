import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://whcrifhmmivpzwtswkff.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4IK7FOYxYe6AlZSStNWI2w_jg_sCcj4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
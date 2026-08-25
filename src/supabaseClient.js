import { createClient } from '@supabase/supabase-js';

// Ваши данные из Supabase
const SUPABASE_URL = 'https://aiethnxmnrgqwpvmbsfy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N__lUkBTT4oKV604BUdQvA_Y-ZsStxK';

// Создаем клиент
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
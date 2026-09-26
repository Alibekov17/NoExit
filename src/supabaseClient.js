import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

const createFallbackClient = () => {
  const makeQuery = (tableName) => ({
    select: () => makeQuery(tableName),
    eq: () => makeQuery(tableName),
    order: () => Promise.resolve({ data: [], error: null }),
    limit: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ data: [], error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  });

  return {
    from: () => makeQuery('fallback_table'),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({ unsubscribe: () => {} }) }),
    removeChannel: () => {},
    rpc: async () => ({ data: null, error: null }),
  };
};

const useRemoteSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_URL !== 'https://demo-project.supabase.co');

export const supabase = useRemoteSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createFallbackClient();